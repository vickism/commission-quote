/** @jest-environment node */
import { createLogger } from './logger.server';

jest.mock('server-only', () => ({}), { virtual: true });

const lines: string[] = [];
const destination = {
  write: (line: string) => {
    lines.push(line);
  },
};
const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;

beforeEach(() => {
  jest.replaceProperty(process, 'env', { ...process.env });
  delete process.env.LOG_LEVEL;
  lines.length = 0;
});

afterEach(() => {
  jest.restoreAllMocks();
});

it('writes newline-delimited JSON with application identity and operational context', () => {
  createLogger(destination).info({ requestId: 'request-1' }, 'test_event');
  expect(lines).toHaveLength(1);
  expect(lines[0].endsWith('\n')).toBe(true);
  expect(JSON.parse(lines[0])).toEqual({
    name: 'commission-quote',
    level: 30,
    time: expect.any(Number),
    pid: expect.any(Number),
    hostname: expect.any(String),
    requestId: 'request-1',
    msg: 'test_event',
  });
});

it.each([undefined, '', 'invalid-sensitive-value', 'INFO'])(
  'defaults LOG_LEVEL=%s to info without logging the configuration value',
  (level) => {
    if (level !== undefined) {
      process.env.LOG_LEVEL = level;
    }
    const logger = createLogger(destination);
    logger.debug('hidden_debug');
    logger.info('visible_info');
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toMatchObject({ level: 30, msg: 'visible_info' });
    expect(lines[0]).not.toContain('invalid-sensitive-value');
  }
);

it.each([...levels, 'silent'] as const)('filters output at LOG_LEVEL=%s', (minimum) => {
  process.env.LOG_LEVEL = minimum;
  const logger = createLogger(destination);
  for (const level of levels) {
    logger[level](level);
  }
  const expected = minimum === 'silent' ? [] : levels.slice(levels.indexOf(minimum));
  expect(lines.map((line) => JSON.parse(line).msg)).toEqual(expected);
});

it.each([
  'apiKey',
  'api-key',
  'COMMISSION_VENDOR_API_KEY',
  'authorization',
  'cookie',
  'headers',
  'req',
  'res',
  'request',
  'response',
  'body',
])('removes sensitive fields under %s while preserving operational context', (field) => {
  createLogger(destination).warn(
    { requestId: 'request-1', [field]: { credential: 'synthetic-secret' } },
    'test_event'
  );
  expect(lines).toHaveLength(1);
  expect(JSON.parse(lines[0])).not.toHaveProperty(field);
  expect(JSON.parse(lines[0])).toMatchObject({ requestId: 'request-1', msg: 'test_event' });
  expect(lines[0]).not.toContain('synthetic-secret');
});
