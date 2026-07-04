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
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.queryByRole('link', { name: 'Projects' })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument();
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
    expect(screen.getByText(/nice work/i)).toBeInTheDocument();
    expect(screen.getByText(/0 tasks in 1 jar/i)).toBeInTheDocument();
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
    expect(screen.getByText(/0 tasks in 1 jar/i)).toBeInTheDocument();
  });

  userEvent.click(screen.getByRole('button', { name: /undo/i }));

  await waitFor(() => {
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');
    expect(screen.getByText(/1 task in 1 jar/i)).toBeInTheDocument();
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

  userEvent.selectOptions(screen.getByLabelText(/choose jar/i), '2');
  userEvent.type(screen.getByLabelText(/new task/i), 'Go outside{enter}');

  await waitFor(() => {
    const collections = JSON.parse(localStorage.getItem('collections') || '[]');
    expect(collections[0].tasks).toHaveLength(0);
    expect(collections[1].tasks).toEqual([{ id: expect.any(Number), name: 'Go outside' }]);
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
