'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Divider,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { schemaResolver, useForm, type FormErrors } from '@mantine/form';
import {
  parseCommissionQuote,
  quoteApiErrorSchema,
  quoteFields,
  type CommissionQuote,
  type QuoteRequest,
} from '../../lib/commission-quotes/contracts';
import { initialQuoteValues, quoteFormSchema } from './form-values';

type ResultState =
  | { status: 'idle' }
  | { status: 'success'; quote: CommissionQuote }
  | { status: 'error'; message: string };

const amountFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const rateFormat = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 6 });
const failureMessage = 'We could not generate a quote. Please try again later.';

export function CommissionQuoteForm() {
  const [result, setResult] = useState<ResultState>({ status: 'idle' });
  const activeController = useRef<AbortController | null>(null);
  const focusField = useRef<(typeof quoteFields)[number] | null>(null);
  const form = useForm({
    name: 'commission-quote',
    mode: 'uncontrolled',
    initialValues: initialQuoteValues,
    validate: schemaResolver(quoteFormSchema, { sync: true }),
    transformValues: (values) => quoteFormSchema.parse(values),
    enhanceGetInputProps: ({ form: currentForm }) => ({ disabled: currentForm.submitting }),
    onValuesChange: () => setResult({ status: 'idle' }),
  });

  useEffect(() => {
    return () => activeController.current?.abort();
  }, []);

  useEffect(() => {
    if (!form.submitting && focusField.current) {
      form.getInputNode(focusField.current)?.focus();
      focusField.current = null;
    }
  }, [form.submitting, form]);

  function focusFirstError(errors: FormErrors) {
    focusField.current = quoteFields.find((field) => errors[field]) ?? null;
  }

  async function submit(input: QuoteRequest) {
    setResult({ status: 'idle' });
    const controller = new AbortController();
    activeController.current = controller;

    try {
      const response = await fetch('/api/commission-quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (controller.signal.aborted) {
        return;
      }
      if (!response.ok) {
        const parsed = quoteApiErrorSchema.safeParse(data);
        if (!parsed.success) {
          setResult({ status: 'error', message: failureMessage });
          return;
        }
        const { error } = parsed.data;
        if (
          error.code === 'INVALID_REQUEST' &&
          error.fieldErrors &&
          Object.keys(error.fieldErrors).length
        ) {
          form.setErrors(error.fieldErrors);
          focusFirstError(error.fieldErrors);
        } else {
          setResult({ status: 'error', message: error.message });
        }
        return;
      }
      const quote = parseCommissionQuote(data);
      setResult(
        quote ? { status: 'success', quote } : { status: 'error', message: failureMessage }
      );
    } catch {
      if (!controller.signal.aborted) {
        setResult({ status: 'error', message: failureMessage });
      }
    } finally {
      activeController.current = null;
    }
  }

  const handleSubmit = form.onSubmit(submit, focusFirstError);

  return (
    <Stack gap="lg">
      <Paper withBorder radius="md" p={{ base: 'md', sm: 'xl' }}>
        <form
          noValidate
          aria-label="Commission quote"
          aria-busy={form.submitting}
          onSubmit={(event) => {
            if (activeController.current) {
              event.preventDefault();
              return;
            }
            handleSubmit(event);
          }}
        >
          <Stack gap="lg">
            <div>
              <Title order={2} size="h3">
                Loan details
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                All fields are required.
              </Text>
            </div>
            <NumberInput
              label="Loan amount"
              description="Enter the amount of the loan."
              placeholder="e.g. 100000"
              prefix="$"
              clampBehavior="none"
              withAsterisk
              aria-required
              key={form.key('loanAmount')}
              {...form.getInputProps('loanAmount')}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              <NumberInput
                label="Loan term (months)"
                description="A whole number of months."
                placeholder="e.g. 36"
                clampBehavior="none"
                withAsterisk
                aria-required
                key={form.key('loanTermInMonths')}
                {...form.getInputProps('loanTermInMonths')}
              />
              <Select
                label="Risk band"
                description="Select the loan risk level."
                placeholder="Choose a risk band"
                data={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                ]}
                withAsterisk
                aria-required
                key={form.key('riskBand')}
                {...form.getInputProps('riskBand')}
              />
            </SimpleGrid>
            <Button type="submit" size="md" fullWidth loading={form.submitting}>
              {form.submitting ? 'Generating quote...' : 'Generate Quote'}
            </Button>
          </Stack>
        </form>
      </Paper>
      <div aria-live="polite" aria-atomic="true">
        <QuoteResult result={result} submitting={form.submitting} />
      </div>
    </Stack>
  );
}

function QuoteResult({ result, submitting }: { result: ResultState; submitting: boolean }) {
  if (submitting) {
    return (
      <Text role="status" c="dimmed">
        Generating your commission quote...
      </Text>
    );
  }
  if (result.status === 'error') {
    return (
      <Alert color="red" title="Unable to generate quote" role="alert">
        {result.message}
      </Alert>
    );
  }
  if (result.status === 'idle') {
    return (
      <Paper withBorder radius="md" p="lg" bg="var(--mantine-color-default-hover)">
        <Text c="dimmed" ta="center">
          Enter the loan details to generate a commission quote.
        </Text>
      </Paper>
    );
  }
  const { quote } = result;
  return (
    <Paper withBorder radius="md" p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="md">
        <Title order={2} size="h3">
          Your commission quote
        </Title>
        <Group justify="space-between">
          <Text c="dimmed">Total commission</Text>
          <Text size="xl" fw={700}>{`$${amountFormat.format(quote.totalCommission)}`}</Text>
        </Group>
        <Group justify="space-between">
          <Text c="dimmed">Commission rate</Text>
          <Text fw={600}>{rateFormat.format(quote.commissionRate)}</Text>
        </Group>
        <Divider />
        <div>
          <Text size="sm" c="dimmed">
            Quote ID
          </Text>
          <Text size="sm" mt={4} style={{ overflowWrap: 'anywhere' }}>
            {quote.quoteId}
          </Text>
        </div>
      </Stack>
    </Paper>
  );
}
