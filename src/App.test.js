import { render, screen } from '@testing-library/react';
import App from './App';

test('renders page heading', () => {
  render(<App />);
  const heading = screen.getByText(/is the grass greener on the azure side/i);
  expect(heading).toBeInTheDocument();
});

test('renders tl;dr section', () => {
  render(<App />);
  const tldr = screen.getByText(/tl;dr/i);
  expect(tldr).toBeInTheDocument();
});

test('renders detail section', () => {
  render(<App />);
  const detail = screen.getByText(/detail/i);
  expect(detail).toBeInTheDocument();
});
