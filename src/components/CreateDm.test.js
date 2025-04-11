// src/components/CreateDM.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateDM from './CreateDM';
import axios from 'axios';
import Notiflix from 'notiflix';
import '@testing-library/jest-dom/extend-expect';

jest.mock('axios');
jest.mock('notiflix');

describe('CreateDM Component', () => {
  const dummyUserList = ['user1', 'user2', 'user3'];
  const currentUser = 'user1';
  const dummyRefresh = jest.fn();
  const dummySetOpen = jest.fn();

  test('renders DM creation form when open', () => {
    render(
      <CreateDM
        open={true}
        setOpen={dummySetOpen}
        currentUser={currentUser}
        userList={dummyUserList}
        refresh={dummyRefresh}
        currentDMs={[]}
      />
    );
    // Check that the heading "New Direct Message" is present
    expect(screen.getByText(/New Direct Message/i)).toBeInTheDocument();
    // Check that the search input is rendered with the correct placeholder
    expect(screen.getByPlaceholderText(/Search for a friend/i)).toBeInTheDocument();
    // Verify that friend options (excluding the current user) are rendered
    expect(screen.getByText(/user2/i)).toBeInTheDocument();
    expect(screen.getByText(/user3/i)).toBeInTheDocument();
    // Ensure that currentUser "user1" is not shown as an option
    expect(screen.queryByText(/^user1$/i)).toBeNull();
  });

  test('submits valid DM creation data and shows success', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'You can now DM this person!' } });
    render(
      <CreateDM
        open={true}
        setOpen={dummySetOpen}
        currentUser={currentUser}
        userList={dummyUserList}
        refresh={dummyRefresh}
        currentDMs={[]}
      />
    );
    // Simulate user typing in the search input
    const searchInput = screen.getByPlaceholderText(/Search for a friend/i);
    fireEvent.change(searchInput, { target: { value: 'user2' } });
    // Simulate selecting "user2" from the rendered options
    const friendOption = screen.getByText(/user2/i);
    fireEvent.click(friendOption);

    // Simulate clicking the "Start chatting" button
    const submitButton = screen.getByRole('button', { name: /Start chatting/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/new-dm'),
        expect.objectContaining({
          users: [currentUser, 'user2']
        }),
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(Notiflix.Notify.success).toHaveBeenCalledWith('You can now DM this person!');
    });
    expect(dummySetOpen).toHaveBeenCalledWith(false);
    expect(dummyRefresh).toHaveBeenCalled();
  });

  test('shows error on invalid DM creation data', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Failed to create DM.' } }
    });

    render(
      <CreateDM
        open={true}
        setOpen={dummySetOpen}
        currentUser={currentUser}
        userList={dummyUserList}
        refresh={dummyRefresh}
        currentDMs={[]}
      />
    );
    const searchInput = screen.getByPlaceholderText(/Search for a friend/i);
    fireEvent.change(searchInput, { target: { value: 'user2' } });
    const friendOption = screen.getByText(/user2/i);
    fireEvent.click(friendOption);

    const submitButton = screen.getByRole('button', { name: /Start chatting/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(Notiflix.Notify.failure).toHaveBeenCalledWith('Failed to create DM.');
    });
  });
});