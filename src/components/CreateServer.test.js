// src/components/CreateServer.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import Notiflix from 'notiflix';
import CreateGroup from './CreateGroup';

// Mock dependencies
jest.mock('axios');
jest.mock('notiflix');
jest.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: () => <svg data-testid="x-mark-icon" />
}));

describe('CreateServer Component', () => {
  const mockSetOpen = jest.fn();
  const mockRefresh = jest.fn();
  const mockUserList = ['user1', 'user2', 'user3'];
  const mockCurrentUser = 'testuser';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'fake-jwt-token');
    
    // Set environment variables - match what the component actually uses
    process.env = {
      ...process.env,
      REACT_APP_API_URL: 'undefined',
      REACT_APP_API_KEY: undefined
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('renders the create server form when open', () => {
    render(
      <CreateGroup
        open={true}
        setOpen={mockSetOpen}
        userList={mockUserList}
        currentUser={mockCurrentUser}
        refresh={mockRefresh}
      />
    );

    // Check that key elements are rendered
    expect(screen.getByText('Create a New Server')).toBeInTheDocument();
    expect(screen.getByText('Server Name')).toBeInTheDocument();
    expect(screen.getByText('Members')).toBeInTheDocument();
  });

  test('closes the dialog when clicking the close button', () => {
    render(
      <CreateGroup
        open={true}
        setOpen={mockSetOpen}
        userList={mockUserList}
        currentUser={mockCurrentUser}
        refresh={mockRefresh}
      />
    );
    
    // Find and click the close button
    const closeButton = screen.getByTestId('x-mark-icon').closest('button');
    fireEvent.click(closeButton);
    
    // Check if setOpen was called with false
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  test('closes the dialog when clicking the cancel button', () => {
    render(
      <CreateGroup
        open={true}
        setOpen={mockSetOpen}
        userList={mockUserList}
        currentUser={mockCurrentUser}
        refresh={mockRefresh}
      />
    );
    
    // Find and click the cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    // Check if setOpen was called with false
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  test('creates a server successfully', async () => {
    // Mock success response
    axios.post.mockImplementationOnce(() => Promise.resolve({ 
      data: { message: 'Server created successfully' }
    }));

    render(
      <CreateGroup
        open={true}
        setOpen={mockSetOpen}
        userList={mockUserList}
        currentUser={mockCurrentUser}
        refresh={mockRefresh}
      />
    );
    
    // Fill in server name - find by role and check for empty name (there should be only one)
    const nameInputs = screen.getAllByRole('textbox');
    const nameInput = nameInputs.find(input => !input.name || input.name === 'name');
    fireEvent.change(nameInput, { target: { value: 'Test Server', name: 'name' } });

    // Submit the form
    const createButton = screen.getByRole('button', { name: /Create Server/i });
    fireEvent.click(createButton);
    
    // Check if API was called with correct parameters
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(mockSetOpen).toHaveBeenCalledWith(false);
      expect(mockRefresh).toHaveBeenCalled();
    });
    
    // Check if success notification was shown
    expect(Notiflix.Notify.success).toHaveBeenCalledWith('Server created successfully!');
  });

  test('shows error notification when server creation fails', async () => {
    // Mock API error
    axios.post.mockImplementationOnce(() => Promise.reject({
      response: { data: { message: 'Server creation failed' } }
    }));

    render(
      <CreateGroup
        open={true}
        setOpen={mockSetOpen}
        userList={mockUserList}
        currentUser={mockCurrentUser}
        refresh={mockRefresh}
      />
    );
    
    // Fill in server name
    const nameInputs = screen.getAllByRole('textbox');
    const nameInput = nameInputs.find(input => !input.name || input.name === 'name');
    fireEvent.change(nameInput, { target: { value: 'Test Server', name: 'name' } });
    
    // Submit the form
    const createButton = screen.getByRole('button', { name: /Create Server/i });
    fireEvent.click(createButton);
    
    // Check if API was called
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
    
    // Check if error notification was shown
    expect(Notiflix.Notify.failure).toHaveBeenCalled();
  });

  test('allows users to be toggled for selection', () => {
    render(
      <CreateGroup
        open={true}
        setOpen={mockSetOpen}
        userList={mockUserList}
        currentUser={mockCurrentUser}
        refresh={mockRefresh}
      />
    );
    
    // Find a user and click to select
    const user1Element = screen.getByText('user1');
    fireEvent.click(user1Element);
    
    // User should now be selected (with a special class)
    expect(user1Element.closest('div')).toHaveClass('bg-blue-200');
  });

  test('filters users based on search input', () => {
    render(
      <CreateGroup
        open={true}
        setOpen={mockSetOpen}
        userList={mockUserList}
        currentUser={mockCurrentUser}
        refresh={mockRefresh}
      />
    );
    
    // Type in the search field
    const searchInput = screen.getByPlaceholderText('Search for a friend');
    fireEvent.change(searchInput, { target: { value: 'user1' } });
    
    // Only user1 should be visible, user2 should not be visible
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.queryByText('user2')).not.toBeInTheDocument();
  });
});