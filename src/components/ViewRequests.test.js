import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ViewRequests from './ViewRequests';
import Notiflix from 'notiflix';
import axios from 'axios';

// Mocks
jest.mock('axios');
jest.mock('notiflix', () => ({
  Notify: {
    success: jest.fn(),
  },
}));

describe('ViewRequests Component', () => {
  const refreshMock = jest.fn();
  const setOpenMock = jest.fn();

  const mockRequests = [
    {
      username: 'alice',
      serverName: 'CoolServer',
      serverId: 'abc123',
    },
  ];

  beforeEach(() => {
    // Set up env
    process.env.REACT_APP_API_URL = 'https://mock-api.com';
    process.env.REACT_APP_API_KEY = 'mock-api-key';

    // Mock token
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        clear: jest.fn(() => {
          store = {};
        }),
        removeItem: jest.fn((key) => {
          delete store[key];
        }),
      };
    })();

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders request and handles accept click', async () => {
    axios.post.mockResolvedValueOnce({ status: 200 });

    render(
      <ViewRequests
        open={true}
        setOpen={setOpenMock}
        requests={mockRequests}
        currentUser={{}}
        refresh={refreshMock}
      />
    );

    expect(screen.getByText(/Pending requests/i)).toBeInTheDocument();

    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "http://localhost:5002/api/servers/request/accept",
        {
          username: 'alice',
          serverId: 'abc123',
        },
        expect.objectContaining({"headers": {"Authorization": "Bearer test-token", "x-api-key": "91623B6134F2EFEE7F5B843A571332DD5B09751D3BEB067F20C80EC0C9D6CE8D"}})
      );
      expect(Notiflix.Notify.success).toHaveBeenCalledWith('Request accepted!');
    });
  });

  it('handles deny click correctly', async () => {
    // Mock the environment and localStorage
    process.env.REACT_APP_API_URL = 'http://localhost:5002/api';
    process.env.REACT_APP_API_KEY = '91623B6134F2EFEE7F5B843A571332DD5B09751D3BEB067F20C80EC0C9D6CE8D';
    localStorage.setItem('token', 'test-token');
  
    axios.post.mockResolvedValueOnce({ status: 200 });
  
    render(
      <ViewRequests
        open={true}
        setOpen={setOpenMock}
        requests={mockRequests}
        currentUser={{}}
        refresh={refreshMock}
      />
    );
  
    const denyButton = screen.getByText('Deny');
    fireEvent.click(denyButton);
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5002/api/servers/request/deny',
        {
          username: 'alice',
          serverId: 'abc123',
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'x-api-key': '91623B6134F2EFEE7F5B843A571332DD5B09751D3BEB067F20C80EC0C9D6CE8D',
          }),
        })
      );
      expect(Notiflix.Notify.success).toHaveBeenCalledWith('Request denied!');
    });
  });

  it('renders fallback when no requests exist', () => {
    render(
      <ViewRequests
        open={true}
        setOpen={setOpenMock}
        requests={[]}
        currentUser={{}}
        refresh={refreshMock}
      />
    );

    expect(screen.getByText('No requests found')).toBeInTheDocument();
  });
});
    
