import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

const originalFetch = global.fetch;
const breeds = {
  labrador: [],
  retriever: ['golden', 'flatcoated'],
  poodle: ['miniature'],
};
function response(message) {
  return Promise.resolve({
    ok: true,
    json: async () => ({ status: 'success', message }),
  });
}
beforeEach(() => {
  global.fetch = jest.fn((url) =>
    url.endsWith('/list/all')
      ? response(breeds)
      : response(['https://images.dog.ceo/breeds/labrador/photo.jpg']),
  );
});
afterEach(() => {
  global.fetch = originalFetch;
});

async function ready() {
  await waitFor(() =>
    expect(screen.getByRole('button', { name: /show dogs/i })).toBeEnabled(),
  );
  await screen.findByRole('img', { name: 'A labrador' });
}

test('shows labeled photo cards and opens the original photo', async () => {
  render(<App />);
  await ready();
  expect(
    screen.getByRole('link', { name: 'Open Labrador photo 1' }),
  ).toHaveAttribute('href', 'https://images.dog.ceo/breeds/labrador/photo.jpg');
  expect(screen.getByLabelText(/sub-breed/i)).toBeDisabled();
});

test('changing breed and sub-breed at the same quantity fetches the new selection', async () => {
  render(<App />);
  await ready();
  fireEvent.change(screen.getByLabelText('Breed'), {
    target: { value: 'retriever' },
  });
  fireEvent.change(screen.getByLabelText(/sub-breed/i), {
    target: { value: 'golden' },
  });
  fireEvent.click(screen.getByRole('button', { name: /show dogs/i }));
  await screen.findByRole('img', { name: 'A golden retriever' });
  expect(global.fetch).toHaveBeenCalledWith(
    'https://dog.ceo/api/breed/retriever/golden/images/random/12',
    expect.any(Object),
  );
  fireEvent.change(screen.getByLabelText('Breed'), {
    target: { value: 'poodle' },
  });
  expect(screen.getByLabelText(/sub-breed/i)).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: /show dogs/i }));
  await screen.findByRole('img', { name: 'A poodle' });
  expect(global.fetch).toHaveBeenCalledWith(
    'https://dog.ceo/api/breed/poodle/images/random/12',
    expect.any(Object),
  );
});

test('blank count loads the full collection and lets the user reveal more cards', async () => {
  render(<App />);
  await ready();
  global.fetch.mockImplementation((url) =>
    response(
      Array.from(
        { length: 30 },
        (_, i) => `https://images.dog.ceo/breeds/labrador/${i}.jpg`,
      ),
    ),
  );
  fireEvent.change(screen.getByLabelText('Photos'), { target: { value: '' } });
  fireEvent.click(screen.getByRole('button', { name: /show dogs/i }));
  const more = await screen.findByRole('button', { name: 'Show more dogs' });
  expect(global.fetch).toHaveBeenLastCalledWith(
    'https://dog.ceo/api/breed/labrador/images',
    expect.any(Object),
  );
  expect(screen.getAllByRole('img')).toHaveLength(24);
  fireEvent.click(more);
  expect(screen.getAllByRole('img')).toHaveLength(30);
  expect(
    screen.queryByRole('button', { name: 'Show more dogs' }),
  ).not.toBeInTheDocument();
});

test('failed image requests show a retry action and recover', async () => {
  global.fetch.mockImplementation((url) =>
    url.endsWith('/list/all')
      ? response(breeds)
      : Promise.reject(new Error('offline')),
  );
  render(<App />);
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'fetching problem',
  );
  global.fetch.mockImplementation(() =>
    response(['https://images.dog.ceo/breeds/labrador/retry.jpg']),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
  await screen.findByRole('img', { name: 'A labrador' });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
