import { render, screen } from '@testing-library/react';
import App from './App';

test('renders page heading', () => {
  render(<App />);
  const heading = screen.getByText(/is the grass greener on the azure side/i);
  expect(heading).toBeInTheDocument();
});

test('renders autoland description', () => {
  render(<App />);
  const desc = screen.getByText(/windows test results from the last/i);
  expect(desc).toBeInTheDocument();
});

test('renders tl;dr section', () => {
  render(<App />);
  const tldr = screen.getByRole('heading', { name: /tl;dr/i });
  expect(tldr).toBeInTheDocument();
});
