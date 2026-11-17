import { randomUUID } from 'node:crypto';
import {
  parseQuoteRequest,
  type QuoteApiError,
  type QuoteErrorCode,
  type QuoteFieldErrors,
} from '../../../lib/commission-quotes/contracts';
import {
  generateVendorQuote,
  VendorQuoteError,
} from '../../../lib/commission-quotes/vendor.server';
import { logger } from '../../../lib/logger.server';

export const runtime = 'nodejs';

class RequestBodyError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

async function readJsonBody(request: Request): Promise<unknown> {
  if (
    request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json'
  ) {
    throw new RequestBodyError(415, 'Send the loan details as JSON.');
  }
  const limit = 16 * 1024;
  if (Number(request.headers.get('content-length')) > limit) {
    throw new RequestBodyError(413, 'The request is too large.');
  }
  const reader = request.body?.getReader();
  if (!reader) {
    throw new RequestBodyError(400, 'Send valid loan details.');
  }
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new RequestBodyError(413, 'The request is too large.');
      }
      chunks.push(value);
    }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  } catch (error) {
    if (error instanceof RequestBodyError) {
      throw error;
    }
    throw new RequestBodyError(400, 'Send valid JSON loan details.');
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID();
  const started = Date.now();
  const headers = { 'Cache-Control': 'no-store', 'X-Request-ID': requestId };

  function failure(
    status: number,
    code: QuoteErrorCode,
    message: string,
    fieldErrors?: QuoteFieldErrors
  ) {
    const body: QuoteApiError = { error: { code, message, ...(fieldErrors && { fieldErrors }) } };
    return Response.json(body, { status, headers });
  }

  try {
    const parsed = parseQuoteRequest(await readJsonBody(request));
    if (!parsed.success) {
      return failure(
        400,
        'INVALID_REQUEST',
        'Check the loan details and try again.',
        parsed.fieldErrors
      );
    }
    const response = Response.json(await generateVendorQuote(parsed.data), { headers });
    logger.info({ requestId, elapsedMs: Date.now() - started }, 'commission_quote_generated');
    return response;
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return failure(error.status, 'INVALID_REQUEST', error.message);
    }
    const category = error instanceof VendorQuoteError ? error.kind : 'unexpected';
    const level = category === 'configuration' || category === 'unexpected' ? 'error' : 'warn';
    logger[level](
      {
        requestId,
        category,
        upstreamStatus: error instanceof VendorQuoteError ? error.upstreamStatus : undefined,
        elapsedMs: Date.now() - started,
      },
      'commission_quote_failed'
    );
    switch (category) {
      case 'timeout':
        return failure(
          504,
          'VENDOR_TIMEOUT',
          'The quote request timed out. A quote may have been generated. Submit again only if you want a new quote.'
        );
      case 'unavailable':
        return failure(
          503,
          'VENDOR_UNAVAILABLE',
          'The quote service is temporarily unavailable. Please try again later.'
        );
      case 'request-failed':
      case 'invalid-response':
        return failure(
          502,
          'VENDOR_ERROR',
          'We could not get a valid quote from the service. Please try again later.'
        );
      default:
        return failure(
          500,
          'INTERNAL_ERROR',
          'We could not generate a quote. Please try again later.'
        );
    }
  }
}
