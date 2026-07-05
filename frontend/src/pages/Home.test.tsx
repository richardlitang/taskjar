import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

beforeEach(() => {
  localStorage.clear();
});

test('guides the user instead of crashing when drawing without tasks', () => {
  localStorage.setItem('collections', JSON.stringify([{ id: 1, name: 'Later', tasks: [] }]));

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /draw a task/i }));

  expect(screen.getByText(/add a task to start drawing/i)).toBeInTheDocument();
});

test('keeps navigation out of the main draw surface', () => {
  localStorage.setItem('user', JSON.stringify('Mina'));

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
});

test('onboards first-run users with a name and starter jars', async () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.getByRole('dialog', { name: /welcome to taskjar/i })).toBeInTheDocument();

  userEvent.type(screen.getByPlaceholderText(/kaye/i), 'Mina');
  userEvent.click(screen.getByRole('button', { name: /continue/i }));

  expect(screen.getByRole('dialog', { name: /choose a starter shelf/i })).toBeInTheDocument();

  userEvent.click(screen.getByRole('radio', { name: /home rhythm/i }));
  userEvent.click(screen.getByRole('button', { name: /start/i }));

  await waitFor(() => {
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem('user')).toBe(JSON.stringify('Mina'));
    expect(collections.map((collection: { name: string }) => collection.name)).toEqual([
      'Kitchen',
      'Laundry',
      'Admin'
    ]);
  });
});

test('lets first-run users start with a blank shelf', async () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /continue/i }));
  userEvent.click(screen.getByRole('radio', { name: /start empty/i }));
  userEvent.click(screen.getByRole('button', { name: /start/i }));

  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem('collections') || '[]')).toEqual([]);
    expect(localStorage.getItem('user')).toBe(JSON.stringify('Kaye'));
    expect(screen.getByText(/hi, kaye/i)).toBeInTheDocument();
    expect(screen.getByText(/no jars yet/i)).toBeInTheDocument();
  });
});

test('replaces the old stranger fallback with Kaye', async () => {
  localStorage.setItem('user', JSON.stringify('Stranger'));
  localStorage.setItem('collections', JSON.stringify([{ id: 1, name: 'Later', tasks: [] }]));

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.getByText(/hi, kaye/i)).toBeInTheDocument();

  await waitFor(() => {
    expect(localStorage.getItem('user')).toBe(JSON.stringify('Kaye'));
  });
});

test('lets the user complete a drawn task', async () => {
  localStorage.setItem(
    'collections',
    JSON.stringify([{ id: 1, name: '5 minutes', tasks: [{ id: 10, name: 'Stretch' }] }])
  );

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /draw a task/i }));
  expect(screen.getByRole('heading', { name: 'Stretch' })).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /complete task/i }));

  await waitFor(() => {
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');

    expect(screen.getByText(/nice work/i)).toBeInTheDocument();
    expect(collections[0].tasks).toHaveLength(0);
  });
});

test('lets the user undo a completed task', async () => {
  localStorage.setItem(
    'collections',
    JSON.stringify([{ id: 1, name: '5 minutes', tasks: [{ id: 10, name: 'Stretch' }] }])
  );

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /draw a task/i }));
  userEvent.click(screen.getByRole('button', { name: /complete task/i }));

  await waitFor(() => {
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');

    expect(collections[0].tasks).toHaveLength(0);
  });

  userEvent.click(screen.getByRole('button', { name: /undo/i }));

  await waitFor(() => {
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');

    expect(collections[0].tasks).toEqual([{ id: 10, name: 'Stretch' }]);
  });
});

test('adds a new task to the selected jar', async () => {
  localStorage.setItem(
    'collections',
    JSON.stringify([
      { id: 1, name: '5 minutes', tasks: [] },
      { id: 2, name: '15 minutes', tasks: [] }
    ])
  );

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /manage jars/i }));
  userEvent.click(screen.getByRole('button', { name: /new slip/i }));
  userEvent.selectOptions(screen.getByLabelText(/choose jar/i), '2');
  userEvent.type(screen.getByLabelText(/task slip/i), 'Go outside');
  userEvent.click(screen.getByRole('button', { name: /add slip/i }));

  await waitFor(() => {
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');
    expect(collections[0].tasks).toHaveLength(0);
    expect(collections[1].tasks).toEqual([{ id: expect.any(Number), name: 'Go outside' }]);
  });
});

test('adds a new jar from the shelf dialog', async () => {
  localStorage.setItem('collections', JSON.stringify([]));

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /manage jars/i }));
  userEvent.click(screen.getByRole('button', { name: /new jar/i }));
  userEvent.type(screen.getByLabelText(/jar name/i), 'Errands');
  userEvent.click(screen.getByRole('button', { name: /add jar/i }));

  await waitFor(() => {
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');
    expect(collections).toEqual([{ id: expect.any(Number), name: 'Errands', tasks: [] }]);
  });
});

test('edits a task with explicit save and cancel controls', async () => {
  localStorage.setItem(
    'collections',
    JSON.stringify([{ id: 1, name: 'Later', tasks: [{ id: 10, name: 'Old slip' }] }])
  );

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /manage jars/i }));
  userEvent.click(screen.getByRole('button', { name: /edit old slip/i }));
  const editInput = screen.getByDisplayValue('Old slip');
  userEvent.clear(editInput);
  userEvent.type(editInput, 'New slip');
  userEvent.click(screen.getByRole('button', { name: /save old slip/i }));

  await waitFor(() => {
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');
    expect(collections[0].tasks).toEqual([{ id: 10, name: 'New slip' }]);
  });
});

test('asks before deleting a jar', async () => {
  localStorage.setItem(
    'collections',
    JSON.stringify([{ id: 1, name: 'Later', tasks: [] }])
  );

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  userEvent.click(screen.getByRole('button', { name: /manage jars/i }));
  userEvent.click(screen.getByRole('button', { name: /delete later jar/i }));

  expect(screen.getByText(/delete this jar/i)).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('collections') || '[]')).toHaveLength(1);

  userEvent.click(screen.getByRole('button', { name: /confirm delete later jar/i }));

  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem('collections') || '[]')).toHaveLength(0);
  });
});
