import { z } from 'zod/v4';
import { quoteRequestSchema, type RiskBand } from '../../lib/commission-quotes/contracts';

export interface QuoteFormValues {
  loanAmount: number | string;
  loanTermInMonths: number | string;
  riskBand: RiskBand | null;
}

export const initialQuoteValues: QuoteFormValues = {
  loanAmount: '',
  loanTermInMonths: '',
  riskBand: null,
};

function normalizeAmount(value: unknown): unknown {
  return typeof value === 'string' && /^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)
    ? Number(value)
    : value;
}

function normalizeTerm(value: unknown): unknown {
  return typeof value === 'string' && /^-?\d+(?:\.0+)?$/.test(value) ? Number(value) : value;
}

export const quoteFormSchema = quoteRequestSchema.extend({
  loanAmount: z.preprocess(normalizeAmount, quoteRequestSchema.shape.loanAmount),
  loanTermInMonths: z.preprocess(normalizeTerm, quoteRequestSchema.shape.loanTermInMonths),
});
