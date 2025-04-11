// src/components/JoinServer.test.js
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act
} from '@testing-library/react';
import JoinServer from './JoinServer';
import axios from 'axios';
import Notiflix from 'notiflix';
import { getDatabase, ref, get } from 'firebase/database';
import '@testing-library/jest-dom/extend-expect';

// Mock external modules
jest.mock('axios');
jest.mock('notiflix');
jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  get: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn()
}));

// Set environment variables used in the component
process.env.REACT_APP_API_URL = 'http://localhost:5002/api';
process.env.REACT_APP_API_KEY =
  '91623B6134F2EFEE7F5B843A571332DD5B09751D3BEB067F20C80EC0C9D6CE8D';

describe('JoinServer Component', () => {
  // Dummy data for tests
  const mockServers = [
    { id: 'server1', name: 'Server One' },
    { id: 'server2', name: 'Server Two' },
    { id: 'server3', name: 'Server Three' }
  ];

  const mockCurrentServers = [{ id: 'server3', name: 'Server Three' }];
  const currentUser = 'user123';
  const dummyRefresh = jest.fn();
  const dummySetOpen = jest.fn();

  // Create a helper to render the component with common props
  const renderJoinServerComponent = async () => {
    await act(async () => {
      render(
        <JoinServer
          open={true}
          setOpen={dummySetOpen}
          servers={mockServers}
          currentServers={mockCurrentServers}
          currentUser={currentUser}
          refresh={dummyRefresh}
        />
      );
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'fake-token');

    // Mock a Firebase snapshot
    const mockSnapshot = {
      exists: jest.fn().mockReturnValue(true),
      val: jest.fn().mockReturnValue({
        server1: {
          name: 'Server One',
          requests: { user123: true }
        },
        server2: { name: 'Server Two' }
      })
    };

    get.mockResolvedValue(mockSnapshot);
    getDatabase.mockReturnValue('mock-db');
    ref.mockReturnValue('mock-ref');
  });

  test('renders server join request form when open', async () => {
    await renderJoinServerComponent();

    // Check that the heading is present
    expect(
      screen.getByText(/Request to join a server/i)
    ).toBeInTheDocument();
    // Check that the search input is rendered with the correct placeholder
    expect(
      screen.getByPlaceholderText(/Search for a server/i)
    ).toBeInTheDocument();
    // Verify that server options (excluding current servers) are rendered
    expect(screen.getByText(/Server One/i)).toBeInTheDocument();
    expect(screen.getByText(/Server Two/i)).toBeInTheDocument();
    // Ensure that the current server "Server Three" is not shown
    expect(screen.queryByText(/Server Three/i)).toBeNull();
  });

  test('filters server list based on search input', async () => {
    await renderJoinServerComponent();

    // Simulate user typing in the search input
    await act(async () => {
      fireEvent.change(
        screen.getByPlaceholderText(/Search for a server/i),
        { target: { value: 'One' } }
      );
    });

    // Verify that only "Server One" appears
    expect(screen.getByText(/Server One/i)).toBeInTheDocument();
    expect(screen.queryByText(/Server Two/i)).toBeNull();
  });

  test('sends join request and shows success notification', async () => {
    axios.post.mockResolvedValueOnce({
      data: { message: 'Request sent successfully!' }
    });

    await renderJoinServerComponent();

    // Find all buttons with the text "Request to join"
    const buttons = screen.getAllByRole('button', {
      name: /Request to join/i
    });

    // Find the non-disabled button (for example, for Server Two).
    const activeButton = buttons.find(
      (button) =>
        !button.classList.contains('bg-indigo-300') &&
        !button.classList.contains('cursor-not-allowed')
    );

    await act(async () => {
      fireEvent.click(activeButton);
    });

    // Verify that the API call is made with the correct arguments
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5002/api/servers/join',
        { serverId: 'server2' },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
            'x-api-key':
              '91623B6134F2EFEE7F5B843A571332DD5B09751D3BEB067F20C80EC0C9D6CE8D'
          })
        })
      );
    });

    await waitFor(() => {
      expect(Notiflix.Notify.success).toHaveBeenCalledWith(
        'Request sent successfully!'
      );
    });
    // Verify that Firebase was queried again to refresh the request list
    expect(get).toHaveBeenCalledTimes(2);
  });

  test('handles errors when sending join request', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(
      () => {}
    );
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    await renderJoinServerComponent();

    const buttons = screen.getAllByRole('button', {
      name: /Request to join/i
    });
    const activeButton = buttons.find(
      (button) =>
        !button.classList.contains('bg-indigo-300') &&
        !button.classList.contains('cursor-not-allowed')
    );

    await act(async () => {
      fireEvent.click(activeButton);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error sending request:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test('disables request buttons for servers that already have pending requests', async () => {
    await renderJoinServerComponent();

    const requestButtons = screen.getAllByRole('button', {
      name: /Request to join/i
    });

    // Expect that for "server1" (which already has a request) the button is disabled
    expect(requestButtons[0]).toHaveClass('bg-indigo-300');
    expect(requestButtons[0]).toHaveClass('cursor-not-allowed');

    // For another server (e.g., server2) the button should be enabled
    expect(requestButtons[1]).toHaveClass('bg-violet-600');
    expect(requestButtons[1]).toHaveClass('hover:bg-violet-700');
  });

  test('closes dialog when back button is clicked', async () => {
    await renderJoinServerComponent();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    });

    expect(dummySetOpen).toHaveBeenCalledWith(false);
  });
});
