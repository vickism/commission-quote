import { quoteRequestSchema } from '../../lib/commission-quotes/contracts';
import { quoteFormSchema } from './form-values';

const valid = { loanAmount: 100000.5, loanTermInMonths: 36, riskBand: 'LOW' };

describe('form values', () => {
  it.each([100000.5, '100000.50', '00100000.50'])('normalizes amount %s', (loanAmount) => {
    expect(quoteFormSchema.parse({ ...valid, loanAmount })).toEqual(valid);
  });

  it('normalizes whole-month decimal text without relaxing server validation', () => {
    const input = { ...valid, loanAmount: '100000.50', loanTermInMonths: '36.0' };
    expect(quoteFormSchema.parse(input)).toEqual(valid);
    expect(quoteRequestSchema.safeParse(input).success).toBe(false);
  });

  it.each(['', ' ', '-', '100.', 'invalid', '1e3', '0x10', '9007199254740992', null, 0, -1])(
    'rejects invalid amount %s',
    (loanAmount) => {
      expect(quoteFormSchema.safeParse({ ...valid, loanAmount }).success).toBe(false);
    }
  );

  it.each(['36.5', '9007199254740990.5', '', 0, -1, 1.5])(
    'rejects invalid term %s',
    (loanTermInMonths) => {
      expect(quoteFormSchema.safeParse({ ...valid, loanTermInMonths }).success).toBe(false);
    }
  );

  it.each([null, 'unknown'])('requires a valid risk band', (riskBand) => {
    expect(quoteFormSchema.safeParse({ ...valid, riskBand }).success).toBe(false);
  });
});
