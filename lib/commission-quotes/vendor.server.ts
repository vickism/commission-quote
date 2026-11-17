import 'server-only';
import { parseCommissionQuote, type CommissionQuote, type QuoteRequest } from './contracts';

type VendorFailure =
  | 'configuration'
  | 'timeout'
  | 'unavailable'
  | 'invalid-response'
  | 'request-failed';

export class VendorQuoteError extends Error {
  constructor(
    public readonly kind: VendorFailure,
    public readonly upstreamStatus?: number
  ) {
    super('Commission vendor request failed');
    this.name = 'VendorQuoteError';
  }
}

function isFetchTimeout(error: unknown): boolean {
  const cause =
    typeof error === 'object' && error !== null && 'cause' in error ? error.cause : undefined;
  const timeoutCodes = [
    'UND_ERR_CONNECT_TIMEOUT',
    'UND_ERR_HEADERS_TIMEOUT',
    'UND_ERR_BODY_TIMEOUT',
  ];
  return [error, cause].some(
    (value) =>
      typeof value === 'object' &&
      value !== null &&
      'code' in value &&
      typeof value.code === 'string' &&
      timeoutCodes.includes(value.code)
  );
}

function vendorConfiguration() {
  const endpoint = process.env.COMMISSION_VENDOR_URL;
  const apiKey = process.env.COMMISSION_VENDOR_API_KEY;
  if (!endpoint || !apiKey || !apiKey.trim() || /[\r\n]/.test(apiKey)) {
    throw new VendorQuoteError('configuration');
  }
  try {
    const url = new URL(endpoint);
    const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    const insecureProduction =
      process.env.NODE_ENV === 'production' && url.protocol !== 'https:' && !isLoopback;
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.hash ||
      insecureProduction
    ) {
      throw new Error('Invalid endpoint');
    }
  } catch {
    throw new VendorQuoteError('configuration');
  }
  return { endpoint, apiKey };
}

export async function generateVendorQuote(input: QuoteRequest): Promise<CommissionQuote> {
  const { endpoint, apiKey } = vendorConfiguration();
  const controller = new AbortController();
  let response: Response | undefined;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': apiKey },
      body: JSON.stringify({
        loanAmount: input.loanAmount,
        loanTermInMonths: input.loanTermInMonths,
        riskBand: input.riskBand,
      }),
      redirect: 'error',
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new VendorQuoteError(
        response.status === 503 ? 'unavailable' : 'request-failed',
        response.status
      );
    }
    const data: unknown = await response.json();
    const quote = parseCommissionQuote(data);
    if (!quote) {
      throw new VendorQuoteError('invalid-response', response.status);
    }
    return quote;
  } catch (error) {
    if (error instanceof VendorQuoteError) {
      throw error;
    }
    if (isFetchTimeout(error)) {
      throw new VendorQuoteError('timeout', response?.status);
    }
    throw new VendorQuoteError(response ? 'invalid-response' : 'request-failed', response?.status);
  } finally {
    controller.abort();
  }
}
