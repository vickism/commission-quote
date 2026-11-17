import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test-utils';
import ErrorPage from './error';

it('shows a generic rendering fallback and recovers only on user request', async () => {
  const retry = jest.fn();
  render(<ErrorPage error={new Error('private error detail')} retry={retry} />);
  expect(screen.queryByText('private error detail')).not.toBeInTheDocument();
  expect(retry).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
  expect(retry).toHaveBeenCalledTimes(1);
});
