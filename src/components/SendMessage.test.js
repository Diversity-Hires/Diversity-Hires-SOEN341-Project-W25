// src/components/SendMessage.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import Notiflix from 'notiflix';

// Mock dependencies
jest.mock('axios');
jest.mock('notiflix');

// Mock the p5 library
jest.mock('p5', () => {
  return function mockP5() {
    return {
      remove: jest.fn()
    };
  };
});

// Mock the Bubbles component that uses p5
jest.mock('../animations/Bubbles', () => {
  return function MockBubbles() {
    return <div data-testid="mock-bubbles">Bubbles Animation</div>;
  };
});

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  UserPlusIcon: () => <svg data-testid="user-plus-icon" />,
  UserMinusIcon: () => <svg data-testid="user-minus-icon" />,
  Cog6ToothIcon: () => <svg data-testid="cog-icon" />,
  ArrowRightStartOnRectangleIcon: () => <svg data-testid="arrow-icon" />
}));

// Mock the headlessui components
jest.mock('@headlessui/react', () => ({
  Disclosure: ({ children }) => <div data-testid="disclosure">{children}</div>,
  DisclosureButton: ({ children }) => <button data-testid="disclosure-button">{children}</button>,
  DisclosurePanel: ({ children }) => <div data-testid="disclosure-panel">{children}</div>,
  Menu: ({ children }) => <div data-testid="menu">{children}</div>,
  MenuButton: ({ children }) => <button data-testid="menu-button">{children}</button>,
  MenuItem: ({ children }) => <div data-testid="menu-item">{children}</div>,
  MenuItems: ({ children }) => <div data-testid="menu-items">{children}</div>
}));

// Mock AdminDropdown component
jest.mock('./Admin_DropDown', () => {
  return function MockAdminDropdown() {
    return <div data-testid="admin-dropdown">Admin Dropdown</div>;
  };
});

// Mock UserStatusIndicator component correctly
jest.mock('./UserStatusIndicator', () => {
  return jest.fn().mockImplementation(({ username, onPresenceChange }) => {
    if (onPresenceChange && typeof onPresenceChange === 'function') {
      setTimeout(() => onPresenceChange('online', Date.now()), 0);
    }
    return <div data-testid="status-indicator">{username}</div>;
  });
});

// Import the actual Chat component after all mocks are defined
import Chat from './Chat';

describe('Chat Component (Server Message Functionality)', () => {
  // Sample test data
  const mockMessages = [
    { 
      id: 'msg1', 
      username: 'user1', 
      text: 'Hello', 
      timestamp: Date.now() - 3600000 
    },
    { 
      id: 'msg2', 
      username: 'user2', 
      text: 'Hi there', 
      timestamp: Date.now() - 1800000 
    }
  ];
  
  const mockSelectedServer = {
    id: '123',
    name: 'Test Server'
  };
  
  // Common props to pass to Chat component
  const defaultProps = {
    messages: mockMessages,
    selectedServer: mockSelectedServer,
    isAdmin: false,
    serverMode: true,
    currentUser: 'testuser',
    openAddUser: jest.fn(),
    openRemoveUser: jest.fn(),
    openChangeRole: jest.fn(),
    selectedMessages: [],
    handleMessageSelect: jest.fn(),
    isDeleteMode: false,
    handleDeleteModeToggle: jest.fn(),
    getUpdatedRoles: jest.fn(),
    refresh: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup localStorage for token
    localStorage.setItem('token', 'fake-jwt-token');
    
    // Setup environment variables that the component needs
    process.env = {
      ...process.env,
      REACT_APP_API_URL: 'undefined', // This matches what's shown in your error
      REACT_APP_API_KEY: undefined  // This matches what's shown in your error
    };
  });
  
  afterEach(() => {
    // Clean up localStorage
    localStorage.clear();
  });

  test('renders chat interface with message input when server is selected', () => {
    render(<Chat {...defaultProps} />);
    
    // Check for server name in header
    expect(screen.getByText('Test Server')).toBeInTheDocument();
    
    // Check for message input and send button
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
    
    // Check if messages are displayed
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
  });

  test('shows placeholder when no server is selected', () => {
    render(<Chat {...defaultProps} selectedServer={null} />);
    
    // Check for placeholder text
    expect(screen.getByText('Select a server to start chatting')).toBeInTheDocument();
  });
});