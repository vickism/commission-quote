import { z } from 'zod/v4';

export const quoteFields = ['loanAmount', 'loanTermInMonths', 'riskBand'] as const;

export const quoteRequestSchema = z.object({
  loanAmount: z
    .number({ error: 'Enter a valid loan amount.' })
    .positive('Loan amount must be greater than zero.')
    .max(Number.MAX_SAFE_INTEGER, 'Loan amount is too large.'),
  loanTermInMonths: z
    .number({ error: 'Enter the loan term in months.' })
    .int('Loan term must be a whole number of months.')
    .positive('Loan term must be greater than zero.')
    .max(Number.MAX_SAFE_INTEGER, 'Loan term is too large.'),
  riskBand: z.enum(['LOW', 'MEDIUM', 'HIGH'], { error: 'Select a risk band.' }),
});

export const commissionQuoteSchema = z.object({
  quoteId: z.string().refine((value) => value.trim().length > 0),
  commissionRate: z.number().nonnegative(),
  totalCommission: z.number().nonnegative(),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;
export type RiskBand = QuoteRequest['riskBand'];
export type CommissionQuote = z.infer<typeof commissionQuoteSchema>;
export type QuoteFieldErrors = Partial<Record<keyof QuoteRequest, string>>;

export const quoteApiErrorSchema = z.object({
  error: z.object({
    code: z.enum([
      'INVALID_REQUEST',
      'VENDOR_UNAVAILABLE',
      'VENDOR_TIMEOUT',
      'VENDOR_ERROR',
      'INTERNAL_ERROR',
    ]),
    message: z.string().min(1),
    fieldErrors: z
      .object({
        loanAmount: z.string().min(1).optional(),
        loanTermInMonths: z.string().min(1).optional(),
        riskBand: z.string().min(1).optional(),
      })
      .strict()
      .optional(),
  }),
});

export type QuoteApiError = z.infer<typeof quoteApiErrorSchema>;
export type QuoteErrorCode = QuoteApiError['error']['code'];

export function parseQuoteRequest(
  value: unknown
): { success: true; data: QuoteRequest } | { success: false; fieldErrors: QuoteFieldErrors } {
  const parsed = quoteRequestSchema.safeParse(value);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }
  const fieldErrors: QuoteFieldErrors = {};
  for (const field of quoteFields) {
    const issue = parsed.error.issues.find((item) => item.path[0] === field);
    if (issue) {
      fieldErrors[field] = issue.message;
    }
  }
  return { success: false, fieldErrors };
}

export function parseCommissionQuote(value: unknown): CommissionQuote | null {
  const parsed = commissionQuoteSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
