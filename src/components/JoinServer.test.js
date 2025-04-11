// src/components/JoinServer.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import JoinServer from './JoinServer';
import axios from 'axios';
import Notiflix from 'notiflix';
import { getDatabase, ref, get } from 'firebase/database';
import '@testing-library/jest-dom/extend-expect';

jest.mock('axios');
jest.mock('notiflix');
jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(),
  ref: jest.fn(),
  get: jest.fn(),
  onValue: jest.fn(),
  off: jest.fn()
}));

// Define a mock for process.env variables needed by the component
process.env.REACT_APP_API_URL = 'http://localhost:5002/api';
process.env.REACT_APP_API_KEY = '91623B6134F2EFEE7F5B843A571332DD5B09751D3BEB067F20C80EC0C9D6CE8D';

describe('JoinServer Component', () => {
  const mockServers = [
    { id: 'server1', name: 'Server One' },
    { id: 'server2', name: 'Server Two' },
    { id: 'server3', name: 'Server Three' }
  ];
  
  const mockCurrentServers = [
    { id: 'server3', name: 'Server Three' }
  ];
  
  const currentUser = 'user123';
  const dummyRefresh = jest.fn();
  const dummySetOpen = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
    
    // Mock Firebase database snapshot
    const mockSnapshot = {
      exists: jest.fn().mockReturnValue(true),
      val: jest.fn().mockReturnValue({
        server1: {
          name: 'Server One',
          requests: { user123: true }
        },
        server2: {
          name: 'Server Two'
        }
      })
    };
    
    get.mockResolvedValue(mockSnapshot);
    getDatabase.mockReturnValue('mock-db');
    ref.mockReturnValue('mock-ref');
  });

  test('renders server join request form when open', async () => {
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
    
    // Check that the heading is present
    expect(screen.getByText(/Request to join a server/i)).toBeInTheDocument();
    
    // Check that the search input is rendered with the correct placeholder
    expect(screen.getByPlaceholderText(/Search for a server/i)).toBeInTheDocument();
    
    // Verify that server options (excluding current servers) are rendered
    expect(screen.getByText(/Server One/i)).toBeInTheDocument();
    expect(screen.getByText(/Server Two/i)).toBeInTheDocument();
    
    // Ensure that current server "Server Three" is not shown as an option
    expect(screen.queryByText(/Server Three/i)).toBeNull();
  });

  test('filters server list based on search input', async () => {
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
    
    // Simulate user typing in the search input
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/Search for a server/i), { target: { value: 'One' } });
    });
    
    // Verify that only "Server One" appears
    expect(screen.getByText(/Server One/i)).toBeInTheDocument();
    expect(screen.queryByText(/Server Two/i)).toBeNull();
  });

  test('sends join request and shows success notification', async () => {
    axios.post.mockResolvedValueOnce({ data: { message: 'Request sent successfully!' } });
    
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
    
    // From the test output we can see "server1" is already in requestsSent
    // So we need to find the button for "Server Two" and click it
    const buttons = screen.getAllByRole('button', { name: /Request to join/i });
    
    // Find the non-disabled button (Server Two)
    const activeButton = buttons.find(button => 
      !button.classList.contains('bg-indigo-300') && 
      !button.classList.contains('cursor-not-allowed')
    );
    
    await act(async () => {
      fireEvent.click(activeButton);
    });
    
    // Verify API call was made with correct arguments
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5002/api/servers/join',
        { serverId: 'server2' }, // We expect server2 because server1 already has a request
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer fake-token',
            'x-api-key': '91623B6134F2EFEE7F5B843A571332DD5B09751D3BEB067F20C80EC0C9D6CE8D'
          })
        })
      );
    });
    
    await waitFor(() => {
      expect(Notiflix.Notify.success).toHaveBeenCalledWith('Request sent successfully!');
    });
    
    // Verify that Firebase was queried again to refresh requests list
    expect(get).toHaveBeenCalledTimes(2);
  });

  test('handles errors when sending join request', async () => {
    // Mock axios to throw an error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    axios.post.mockRejectedValueOnce(new Error('Network error'));
    
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
    
    // Find the non-disabled button (Server Two)
    const buttons = screen.getAllByRole('button', { name: /Request to join/i });
    const activeButton = buttons.find(button => 
      !button.classList.contains('bg-indigo-300') && 
      !button.classList.contains('cursor-not-allowed')
    );
    
    await act(async () => {
      fireEvent.click(activeButton);
    });
    
    // Verify error was logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending request:', expect.any(Error));
    });
    
    consoleErrorSpy.mockRestore();
  });

  test('disables request buttons for servers that already have pending requests', async () => {
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
    
    // Find request buttons more specifically to avoid catching other elements
    const requestButtons = screen.getAllByRole('button', { name: /Request to join/i });
    
    // First button (for server1) should have the disabled style class
    expect(requestButtons[0]).toHaveClass('bg-indigo-300');
    expect(requestButtons[0]).toHaveClass('cursor-not-allowed');
    
    // Second button (for server2) should have the enabled style class
    expect(requestButtons[1]).toHaveClass('bg-violet-600');
    expect(requestButtons[1]).toHaveClass('hover:bg-violet-700');
  });

  test('closes dialog when back button is clicked', async () => {
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
    
    // Click the back button
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    });
    
    // Verify setOpen was called with false
    expect(dummySetOpen).toHaveBeenCalledWith(false);
  });
});
