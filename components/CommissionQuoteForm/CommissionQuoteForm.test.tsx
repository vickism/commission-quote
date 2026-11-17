import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test-utils';
import { CommissionQuoteForm } from './CommissionQuoteForm';

const quote = { quoteId: 'quote-1', commissionRate: 0.0065, totalCommission: 650 };
const fetchMock = jest.fn();
const response = (body: unknown, ok = true) => ({ ok, json: async () => body });

beforeEach(() => {
  global.fetch = fetchMock;
  fetchMock.mockReset().mockResolvedValue(response(quote));
});

afterEach(() => {
  jest.useRealTimers();
});

async function fill(amount = '100000') {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/Loan amount/), amount);
  await user.type(screen.getByLabelText(/Loan term \(months\)/), '36');
  await user.click(screen.getByRole('combobox', { name: /Risk band/ }));
  await user.click(await screen.findByRole('option', { name: 'Low' }));
  return user;
}

it('starts empty and validates before making a request', async () => {
  render(<CommissionQuoteForm />);
  expect(
    screen.getByText('Enter the loan details to generate a commission quote.')
  ).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Generate Quote' }));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByLabelText(/Loan amount/)).toHaveFocus();
  expect(screen.getByLabelText(/Loan amount/)).toHaveAttribute('aria-invalid', 'true');
  await userEvent.click(screen.getByRole('button', { name: 'Generate Quote' }));
  expect(screen.getByLabelText(/Loan amount/)).toHaveFocus();
  expect(fetchMock).not.toHaveBeenCalled();
});

it('submits numeric decimal data with Enter before amount blur', async () => {
  render(<CommissionQuoteForm />);
  const user = await fill('100000.50');
  await user.click(screen.getByLabelText(/Loan amount/));
  await user.keyboard('{Enter}');
  await screen.findByText('quote-1');
  const [url, options] = fetchMock.mock.calls[0];
  expect(url).toBe('/api/commission-quotes');
  expect(JSON.parse(options.body)).toEqual({
    loanAmount: 100000.5,
    loanTermInMonths: 36,
    riskBand: 'LOW',
  });
  expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
  expect(screen.getByText('$650.00')).toBeInTheDocument();
  expect(screen.getByText('0.65%')).toBeInTheDocument();
});

it('keeps the original request pending across duplicate submit events', async () => {
  let finish!: (value: unknown) => void;
  fetchMock.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  render(<CommissionQuoteForm />);
  await fill();
  const button = screen.getByRole('button', { name: 'Generate Quote' });
  fireEvent.submit(button.closest('form')!);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  fireEvent.submit(button.closest('form')!);
  fireEvent.submit(button.closest('form')!);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(screen.getByLabelText(/Loan amount/)).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Generating quote...' })).toBeDisabled();
  await act(async () => {
    finish(response(quote));
  });
  await screen.findByText('quote-1');
  expect(screen.getByLabelText(/Loan amount/)).toBeEnabled();
});

it('preserves the precision of the medium risk rate', async () => {
  fetchMock.mockResolvedValue(response({ ...quote, commissionRate: 0.00675 }));
  render(<CommissionQuoteForm />);
  await fill();
  await userEvent.click(screen.getByRole('button', { name: 'Generate Quote' }));
  expect(await screen.findByText('0.675%')).toBeInTheDocument();
});

it('renders a valid zero commission', async () => {
  fetchMock.mockResolvedValue(response({ ...quote, commissionRate: 0, totalCommission: 0 }));
  render(<CommissionQuoteForm />);
  await fill();
  await userEvent.click(screen.getByRole('button', { name: 'Generate Quote' }));
  expect(await screen.findByText('$0.00')).toBeInTheDocument();
  expect(screen.getByText('0%')).toBeInTheDocument();
});

it('removes stale results when inputs change', async () => {
  render(<CommissionQuoteForm />);
  const user = await fill();
  await user.click(screen.getByRole('button', { name: 'Generate Quote' }));
  await screen.findByText('quote-1');
  await user.type(screen.getByLabelText(/Loan amount/), '1');
  expect(screen.queryByText('quote-1')).not.toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('maps server field errors, focuses after pending, and clears only the changed field error', async () => {
  fetchMock.mockResolvedValue(
    response(
      {
        error: {
          code: 'INVALID_REQUEST',
          message: 'Check the loan details.',
          fieldErrors: { loanTermInMonths: 'Choose another term.' },
        },
      },
      false
    )
  );
  render(<CommissionQuoteForm />);
  const user = await fill();
  await user.click(screen.getByRole('button', { name: 'Generate Quote' }));
  await screen.findByText('Choose another term.');
  await waitFor(() => expect(screen.getByLabelText(/Loan term \(months\)/)).toHaveFocus());
  await user.type(screen.getByLabelText(/Loan amount/), '1');
  expect(screen.getByText('Choose another term.')).toBeInTheDocument();
  await user.type(screen.getByLabelText(/Loan term \(months\)/), '1');
  expect(screen.queryByText('Choose another term.')).not.toBeInTheDocument();
});

it.each([
  { error: { code: 'VENDOR_UNAVAILABLE', message: 'Service temporarily unavailable.' } },
  {
    error: {
      code: 'VENDOR_TIMEOUT',
      message: 'The quote request timed out. A quote may have been generated.',
    },
  },
  {
    error: {
      code: 'INVALID_REQUEST',
      message: 'Invalid',
      fieldErrors: { unknown: 'Do not render me' },
    },
  },
  { unexpected: 'Do not render me' },
])('recovers from safe or malformed service errors', async (body) => {
  fetchMock.mockResolvedValueOnce(response(body, false));
  render(<CommissionQuoteForm />);
  const user = await fill();
  await user.click(screen.getByRole('button', { name: 'Generate Quote' }));
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  expect(screen.queryByText('Do not render me')).not.toBeInTheDocument();
  expect(screen.getByLabelText(/Loan amount/)).toBeEnabled();
  expect(screen.getByLabelText(/Loan term \(months\)/)).toHaveValue('36');
  fetchMock.mockResolvedValueOnce(response(quote));
  await user.click(screen.getByRole('button', { name: 'Generate Quote' }));
  await screen.findByText('quote-1');
});

it.each(['network', 'invalid-json', 'invalid-quote'])(
  'handles %s failures without stale results',
  async (kind) => {
    render(<CommissionQuoteForm />);
    const user = await fill();
    await user.click(screen.getByRole('button', { name: 'Generate Quote' }));
    await screen.findByText('quote-1');
    if (kind === 'network') {
      fetchMock.mockRejectedValueOnce(new Error('Private failure text'));
    }
    if (kind === 'invalid-json') {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Private failure text');
        },
      });
    }
    if (kind === 'invalid-quote') {
      fetchMock.mockResolvedValueOnce(response({ quoteId: 'invalid' }));
    }
    await user.click(screen.getByRole('button', { name: 'Generate Quote' }));
    await screen.findByRole('alert');
    expect(screen.queryByText('quote-1')).not.toBeInTheDocument();
    expect(screen.queryByText('Private failure text')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Loan amount/)).toBeEnabled();
  }
);

it('keeps a slow request loading and blocks resubmission until it settles', async () => {
  render(<CommissionQuoteForm />);
  await fill();
  jest.useFakeTimers();
  let finish!: (value: unknown) => void;
  fetchMock.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  fireEvent.submit(screen.getByRole('button', { name: 'Generate Quote' }).closest('form')!);
  await act(async () => {
    await jest.advanceTimersByTimeAsync(30000);
  });
  const button = screen.getByRole('button', { name: 'Generating quote...' });
  expect(button).toBeDisabled();
  expect(screen.getByLabelText(/Loan amount/)).toBeDisabled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent.submit(button.closest('form')!);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish(response(quote));
  });
  expect(screen.getByText('quote-1')).toBeInTheDocument();
  expect(screen.getByLabelText(/Loan amount/)).toBeEnabled();
});

it('aborts a pending request when the form unmounts', async () => {
  fetchMock.mockImplementation(
    (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener(
          'abort',
          () => reject(new DOMException('Request aborted', 'AbortError')),
          { once: true }
        );
      })
  );
  const view = render(<CommissionQuoteForm />);
  await fill();
  fireEvent.submit(screen.getByRole('button', { name: 'Generate Quote' }).closest('form')!);
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
  const signal = fetchMock.mock.calls[0][1].signal;
  view.unmount();
  expect(signal.aborted).toBe(true);
});
