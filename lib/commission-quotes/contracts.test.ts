import { commissionQuoteSchema, parseCommissionQuote, parseQuoteRequest } from './contracts';

const valid = { loanAmount: 100000.5, loanTermInMonths: 36, riskBand: 'LOW' };

describe('quote request boundary', () => {
  it.each(['LOW', 'MEDIUM', 'HIGH'])('accepts %s risk', (riskBand) => {
    expect(parseQuoteRequest({ ...valid, riskBand })).toEqual({
      success: true,
      data: { ...valid, riskBand },
    });
  });

  it.each([0, -1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '', '100', null, true])(
    'rejects invalid amount %s',
    (loanAmount) => {
      expect(parseQuoteRequest({ ...valid, loanAmount })).toMatchObject({
        success: false,
        fieldErrors: { loanAmount: expect.any(String) },
      });
    }
  );

  it.each([0, -1, 1.5, Infinity, Number.MAX_SAFE_INTEGER + 1, '36', null])(
    'rejects invalid term %s',
    (loanTermInMonths) => {
      expect(parseQuoteRequest({ ...valid, loanTermInMonths })).toMatchObject({
        success: false,
        fieldErrors: { loanTermInMonths: expect.any(String) },
      });
    }
  );

  it.each([null, [], {}, true, 'loan', { ...valid, riskBand: 'UNKNOWN' }])(
    'rejects invalid request %j',
    (input) => {
      expect(parseQuoteRequest(input).success).toBe(false);
    }
  );

  it('projects only agreed fields', () => {
    expect(parseQuoteRequest({ ...valid, extra: 'ignore' })).toEqual({
      success: true,
      data: valid,
    });
  });
});

describe('quote response boundary', () => {
  const quote = { quoteId: 'quote-1', commissionRate: 0.0065, totalCommission: 650 };

  it('accepts and projects the agreed fields', () => {
    expect(parseCommissionQuote({ ...quote, privateData: 'ignored' })).toEqual(quote);
  });

  it('accepts zero commission', () => {
    expect(
      commissionQuoteSchema.safeParse({ ...quote, commissionRate: 0, totalCommission: 0 }).success
    ).toBe(true);
  });

  it.each([
    { quoteId: '' },
    { quoteId: '   ' },
    { commissionRate: '0.0065' },
    { commissionRate: -1 },
    { commissionRate: Infinity },
    { totalCommission: -1 },
    { totalCommission: NaN },
    { totalCommission: null },
    { quoteId: null },
  ])('rejects invalid response %j', (change) => {
    expect(parseCommissionQuote({ ...quote, ...change })).toBeNull();
  });

  it.each([null, [], {}, { quoteId: 'quote-1' }])('rejects incomplete response %j', (value) => {
    expect(parseCommissionQuote(value)).toBeNull();
  });
});

it('preserves opaque quote identifiers exactly as supplied', () => {
  expect(
    parseCommissionQuote({ quoteId: '  opaque-quote-id  ', commissionRate: 0, totalCommission: 0 })
      ?.quoteId
  ).toBe('  opaque-quote-id  ');
});
