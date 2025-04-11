import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar'; 
import { setUserOffline, isUserAway, toggleUserAway } from '../presence';

// Mock the presence functions
jest.mock('../presence', () => ({
  setUserOffline: jest.fn(),
  isUserAway: jest.fn(),
  toggleUserAway: jest.fn()
}));
jest.mock('react-switch', () => {
  const MockSwitch = function(props) {
    return (
      <button
        data-testid="mock-switch" // Ensure this matches the test query
        onClick={() => props.onChange && props.onChange(!props.checked)}
        aria-checked={props.checked}
      >
        Toggle Switch
      </button>
    );
  };
  return MockSwitch;
});

// Mock other imports used in Navbar
jest.mock('../images/Logo.png', () => 'logo-mock');
jest.mock('../images/DmIcon.png', () => 'dm-icon-mock');
jest.mock('../images/GcIcon.png', () => 'gc-icon-mock');
jest.mock('../components/ViewRequests', () => ({ open, setOpen, requests, currentUser, refresh }) => (
  <div data-testid="view-requests-mock">View Requests Mock</div>
));

// Mock ResizeObserver before tests
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Navbar Component Presence Tests', () => {
  const mockUser = 'testUser';
  const mockJoinRequests = [];
  const mockGetRequests = jest.fn();
  const mockToggleServerMode = jest.fn();
  
  // Helper to render component with default props
  const renderNavbar = (props = {}) => {
    const defaultProps = {
      user: mockUser,
      serverMode: true,
      toggleServerMode: mockToggleServerMode,
      setOpenSnek: jest.fn(),
      joinRequestsForUser: mockJoinRequests,
      getRequests: mockGetRequests,
      ...props
    };
    
    return render(<Navbar {...defaultProps} />);
  };
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  test('checks user away status on mount', async () => {
    // Mock isUserAway to resolve with false (user is not away)
    isUserAway.mockResolvedValueOnce(false);
    
    renderNavbar();
    
    // Check if isUserAway was called with the user
    expect(isUserAway).toHaveBeenCalledWith(mockUser);
    
    // Verify the Away switch is initialized properly
    await waitFor(() => {
      // Open the user menu to access the Away toggle
      const userMenuButton = screen.getByRole('button', { name: /Open user menu/i });
      fireEvent.click(userMenuButton);
    });
    
    // Find the Away switch - it should be unchecked
    const awaySwitch = screen.getByText('Away');
    expect(awaySwitch).toBeInTheDocument();
  });
  
  
  test('sets user offline when logging out', async () => {
    isUserAway.mockResolvedValueOnce(false);
    
    // Mock localStorage
    const originalLocalStorage = window.localStorage;
    const localStorageMock = {
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    // Mock window.location.href setter
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '' };
    
    renderNavbar();
    
    // Open the user menu
    const userMenuButton = screen.getByRole('button', { name: /Open user menu/i });
    fireEvent.click(userMenuButton);
    
    // Find and click the "Sign out" button
    const signOutButton = screen.getByText('Sign out');
    fireEvent.click(signOutButton);
    
    // Verify setUserOffline was called
    expect(setUserOffline).toHaveBeenCalledWith(mockUser);
    
    // Verify localStorage.removeItem was called
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    
    // Verify window.location.href was set to '/'
    expect(window.location.href).toBe('/');
    
    // Restore original objects
    window.localStorage = originalLocalStorage;
    window.location = originalLocation;
  });
  
  test('updates away status when serverMode changes', async () => {
    // First render
    isUserAway.mockResolvedValueOnce(false);
    const { rerender } = renderNavbar({ serverMode: true });
    
    await waitFor(() => {
      expect(isUserAway).toHaveBeenCalledTimes(1);
    });
    
    // Clear mocks and re-render with different serverMode
    jest.clearAllMocks();
    isUserAway.mockResolvedValueOnce(true);
    
    rerender(
      <Navbar 
        user={mockUser}
        serverMode={false} 
        toggleServerMode={mockToggleServerMode}
        setOpenSnek={jest.fn()}
        joinRequestsForUser={mockJoinRequests}
        getRequests={mockGetRequests}
      />
    );
    
    // Verify isUserAway was called again due to useEffect dependency on serverMode
    await waitFor(() => {
      expect(isUserAway).toHaveBeenCalledTimes(1);
      expect(isUserAway).toHaveBeenCalledWith(mockUser);
    });
  });
  
  test('displays the current user name in the navbar', () => {
    isUserAway.mockResolvedValueOnce(false);
    renderNavbar({ user: 'JohnDoe' });
    
    const userNameElement = screen.getByText('JohnDoe');
    expect(userNameElement).toBeInTheDocument();
  });
  
  test('shows notification indicator when there are join requests', () => {
    isUserAway.mockResolvedValueOnce(false);
    
    // Render with join requests
    renderNavbar({ joinRequestsForUser: [{ id: 1, username: 'requestUser' }] });
    
    // Find the notification button that should have the special class
    const notificationButton = screen.getByRole('button', { name: /View notifications/i });
    expect(notificationButton).toHaveClass('bg-rose-500');
  });
  
  test('does not show notification indicator when there are no join requests', () => {
    isUserAway.mockResolvedValueOnce(false);
    
    // Render with no join requests
    renderNavbar({ joinRequestsForUser: [] });
    
    // Find the notification button that should NOT have the special class
    const notificationButton = screen.getByRole('button', { name: /View notifications/i });
    expect(notificationButton).not.toHaveClass('bg-rose-500');
  });

  test('toggles user away status when switch is clicked', async () => {
    isUserAway.mockResolvedValue(false);
  
    renderNavbar();
  
    await waitFor(() => {
      expect(isUserAway).toHaveBeenCalledWith(mockUser);
    });
  
    const userMenuButton = screen.getByRole('button', { name: /Open user menu/i });
    fireEvent.click(userMenuButton);
  
    const toggleSwitch = screen.getByTestId('mock-switch');
    expect(toggleSwitch).toBeInTheDocument();
  
    fireEvent.click(toggleSwitch);
  
    expect(toggleUserAway).toHaveBeenCalledTimes(1);
    expect(toggleUserAway).toHaveBeenCalledWith(mockUser);
  });  

  
  


  
});