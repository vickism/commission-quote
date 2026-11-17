/** @jest-environment node */
import { POST } from './route';

jest.mock('server-only', () => ({}), { virtual: true });

const input = { loanAmount: 100000, loanTermInMonths: 36, riskBand: 'LOW' };
const quote = { quoteId: 'quote-1', commissionRate: 0.0065, totalCommission: 650 };
const realFetch = global.fetch;
const fetchMock = jest.fn();
let warn: jest.SpyInstance;

function request(body: unknown = input) {
  return new Request('http://localhost/api/commission-quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.COMMISSION_VENDOR_URL = 'http://vendor.test/commission-quotes';
  process.env.COMMISSION_VENDOR_API_KEY = 'synthetic-test-key';
  global.fetch = fetchMock;
  fetchMock.mockReset().mockResolvedValue(Response.json(quote));
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
  jest.useRealTimers();
  delete process.env.COMMISSION_VENDOR_URL;
  delete process.env.COMMISSION_VENDOR_API_KEY;
});

it('validates input, authenticates exactly once and returns a minimal quote', async () => {
  fetchMock.mockResolvedValue(Response.json({ ...quote, vendorPrivate: 'not public' }));
  const response = await POST(request({ ...input, ignored: 'not upstream' }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(quote);
  expect(response.headers.get('cache-control')).toBe('no-store');
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe(process.env.COMMISSION_VENDOR_URL);
  expect(options.headers).toEqual({
    'Content-Type': 'application/json',
    'api-key': 'synthetic-test-key',
  });
  expect(options.method).toBe('POST');
  expect(options.redirect).toBe('error');
  expect(JSON.parse(options.body)).toEqual(input);
});

it.each([{}, null, [], { ...input, loanAmount: '100000' }, { ...input, loanTermInMonths: 1.5 }])(
  'rejects invalid input without upstream traffic: %j',
  async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('INVALID_REQUEST');
    expect(fetchMock).not.toHaveBeenCalled();
  }
);

it('rejects invalid JSON safely', async () => {
  const response = await POST(
    new Request('http://localhost/api/commission-quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{broken',
    })
  );
  expect(response.status).toBe(400);
  expect(fetchMock).not.toHaveBeenCalled();
});

it('rejects unsupported content types', async () => {
  const response = await POST(
    new Request('http://localhost/api/commission-quotes', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  );
  expect(response.status).toBe(415);
  expect(fetchMock).not.toHaveBeenCalled();
});

it.each([undefined, '1'])(
  'bounds the body even with missing/incorrect Content-Length %s',
  async (length) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (length) {
      headers['Content-Length'] = length;
    }
    const response = await POST(
      new Request('http://localhost/api/commission-quotes', {
        method: 'POST',
        headers,
        body: ' '.repeat(16 * 1024 + 1),
      })
    );
    expect(response.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  }
);

it.each([
  ['COMMISSION_VENDOR_API_KEY', ''],
  ['COMMISSION_VENDOR_URL', 'invalid'],
  ['COMMISSION_VENDOR_URL', 'file:///private'],
  ['COMMISSION_VENDOR_URL', 'https://user:password@vendor.test'],
])('rejects invalid configuration %s safely', async (key, value) => {
  process.env[key] = value;
  const response = await POST(request());
  expect(response.status).toBe(500);
  expect((await response.json()).error.code).toBe('INTERNAL_ERROR');
  expect(fetchMock).not.toHaveBeenCalled();
});

it.each([
  [401, 502],
  [403, 502],
  [404, 502],
  [429, 502],
  [500, 502],
  [503, 503],
])(
  'maps upstream %s to %s without exposing the upstream body',
  async (upstreamStatus, expectedStatus) => {
    fetchMock.mockResolvedValue(
      new Response('synthetic-test-key upstream detail', { status: upstreamStatus })
    );
    const response = await POST(request());
    expect(response.status).toBe(expectedStatus);
    expect(await response.text()).not.toContain('synthetic-test-key');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(warn.mock.calls)).not.toContain('synthetic-test-key');
    expect(JSON.stringify(warn.mock.calls)).not.toContain('100000');
    expect(warn.mock.calls[0][1].requestId).toBe(response.headers.get('x-request-id'));
  }
);

it.each([
  'not json',
  JSON.stringify({ ...quote, commissionRate: '0.0065' }),
  JSON.stringify({ ...quote, quoteId: '' }),
  JSON.stringify({ ...quote, totalCommission: -1 }),
])('rejects malformed successful vendor data', async (body) => {
  fetchMock.mockResolvedValue(new Response(body));
  const response = await POST(request());
  expect(response.status).toBe(502);
  expect((await response.json()).error.code).toBe('VENDOR_ERROR');
});

it('handles a failed network request without exposing exception text', async () => {
  fetchMock.mockRejectedValue(new Error('synthetic-test-key'));
  const response = await POST(request());
  expect(response.status).toBe(502);
  expect(await response.text()).not.toContain('synthetic-test-key');
  expect(JSON.stringify(warn.mock.calls)).not.toContain('synthetic-test-key');
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

describe.each(['UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_HEADERS_TIMEOUT', 'UND_ERR_BODY_TIMEOUT'])(
  'native fetch timeout %s',
  (code) => {
    it.each(['fetch', 'body', 'unwrapped'])('handles a timeout from %s', async (stage) => {
      const cause = Object.assign(new Error('synthetic-test-key'), { code });
      const failure = stage === 'unwrapped' ? cause : new TypeError('fetch failed', { cause });
      if (stage === 'body') {
        fetchMock.mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => {
            throw failure;
          },
        });
      } else {
        fetchMock.mockRejectedValue(failure);
      }
      const response = await POST(request());
      expect(response.status).toBe(504);
      const body = await response.json();
      expect(body.error.code).toBe('VENDOR_TIMEOUT');
      expect(body.error.message).toContain('timed out');
      expect(JSON.stringify(body)).not.toContain('synthetic-test-key');
      expect(JSON.stringify(warn.mock.calls)).not.toContain('synthetic-test-key');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(true);
    });
  }
);

it.each(['ECONNREFUSED', 'UND_ERR_SOCKET'])(
  'does not misclassify %s as a timeout',
  async (code) => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed', { cause: { code } }));
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect((await response.json()).error.code).toBe('VENDOR_ERROR');
  }
);

it('waits for fetch to settle instead of imposing an application deadline', async () => {
  jest.useFakeTimers();
  let finish!: (response: Response) => void;
  fetchMock.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  let settled = false;
  const pending = POST(request());
  pending.then(() => {
    settled = true;
  });
  await jest.advanceTimersByTimeAsync(30000);
  expect(settled).toBe(false);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][1].signal.aborted).toBe(false);
  finish(Response.json(quote));
  expect((await pending).status).toBe(200);
});

it('releases a streaming vendor error connection without changing its status', async () => {
  const { createServer } = await import('node:http');
  let closed = false;
  const server = createServer((incoming, outgoing) => {
    incoming.socket.once('close', () => {
      closed = true;
    });
    outgoing.writeHead(incoming.headers['api-key'] === 'synthetic-test-key' ? 503 : 401);
    outgoing.write('unfinished error body');
  });
  await new Promise<void>((resolve) => {
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Test server did not start');
  }
  process.env.COMMISSION_VENDOR_URL = `http://127.0.0.1:${address.port}/commission-quotes`;
  global.fetch = realFetch;
  try {
    const response = await POST(request());
    expect(response.status).toBe(503);
    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });
    expect(closed).toBe(true);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

it('rejects remote plain HTTP when running in production', async () => {
  const environment = jest.replaceProperty(process.env, 'NODE_ENV', 'production');
  try {
    const response = await POST(request());
    expect(response.status).toBe(500);
    expect(fetchMock).not.toHaveBeenCalled();
  } finally {
    environment.restore();
  }
});
