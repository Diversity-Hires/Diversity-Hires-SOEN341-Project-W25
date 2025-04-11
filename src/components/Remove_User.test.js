// src/components/Remove_User.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RemoveUser from './Remove_user';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Notiflix from 'notiflix';
import '@testing-library/jest-dom/extend-expect';

jest.mock('axios');
jest.mock('notiflix');
jest.mock('jwt-decode');

describe('RemoveUser Component', () => {
  const mockServerUsers = [
    { username: 'admin' },
    { username: 'user1' },
    { username: 'user2' }
  ];
  const mockServerId = 'server123';
  const mockUpdateUserList = jest.fn();
  const mockSetOpen = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = jest.fn(() => 'mock-token');
    // Mock jwt decode to return a user id
    jwtDecode.mockReturnValue({ id: 'admin' });
    // Mock axios delete to resolve successfully
    axios.delete = jest.fn().mockResolvedValue({ data: { success: true } });
    // Mock Notiflix notifications
    Notiflix.Notify = {
      success: jest.fn(),
      warning: jest.fn(),
      failure: jest.fn()
    };
  });

  test('renders user removal form when open', () => {
    render(
      <RemoveUser
        open={true}
        setOpen={mockSetOpen}
        serverId={mockServerId}
        serverUsers={mockServerUsers}
        updateUserList={mockUpdateUserList}
      />
    );
    
    // Check that the heading is present
    expect(screen.getByText(/Remove User from Server/i)).toBeInTheDocument();
    
    // Check that the select dropdown is rendered
    expect(screen.getByText(/Select User/i)).toBeInTheDocument();
    
    // Verify that user options (excluding the current user) are rendered
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
    
    // Ensure admin is not shown as an option (current user)
    expect(screen.queryByText(/^admin$/i)).toBeNull();
    
    // Check that other users are available in the dropdown
    expect(screen.getByText(/user1/i)).toBeInTheDocument();
    expect(screen.getByText(/user2/i)).toBeInTheDocument();
    
    // Check that the cancel and submit buttons are present
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Remove User/i })).toBeInTheDocument();
  });

  // Test user interaction with dropdown
  test('allows selecting a user from dropdown', async () => {
    render(
      <RemoveUser
        open={true}
        setOpen={mockSetOpen}
        serverId={mockServerId}
        serverUsers={mockServerUsers}
        updateUserList={mockUpdateUserList}
      />
    );
    
    // Select a user from the dropdown
    const selectElement = screen.getByRole('combobox');
    userEvent.selectOptions(selectElement, 'user1');
    
    // Check that the selected value is updated
    expect(selectElement).toHaveValue('user1');
  });

  // Test form submission with validation
  test('validates that a user is selected before submission', async () => {
    render(
      <RemoveUser
        open={true}
        setOpen={mockSetOpen}
        serverId={mockServerId}
        serverUsers={mockServerUsers}
        updateUserList={mockUpdateUserList}
      />
    );
    
    // Try to submit without selecting a user
    const submitButton = screen.getByRole('button', { name: /Remove User/i });
    fireEvent.click(submitButton);
    
    // Check that warning notification was shown
    expect(Notiflix.Notify.warning).toHaveBeenCalledWith('Please select a user to remove.');
    
    // Verify API was not called
    expect(axios.delete).not.toHaveBeenCalled();
  });

  // Test successful API call and callbacks
  test('successfully removes user when form is submitted', async () => {
    render(
      <RemoveUser
        open={true}
        setOpen={mockSetOpen}
        serverId={mockServerId}
        serverUsers={mockServerUsers}
        updateUserList={mockUpdateUserList}
      />
    );
    
    // Select a user
    const selectElement = screen.getByRole('combobox');
    userEvent.selectOptions(selectElement, 'user1');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Remove User/i });
    fireEvent.click(submitButton);
    
    // Wait for async operations
    await waitFor(() => {
      // Check that API was called with correct parameters
      expect(axios.delete).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.any(Object),
          data: {
            serverId: mockServerId,
            username: 'user1'
          }
        })
      );
      
      // Check that updateUserList callback was called
      expect(mockUpdateUserList).toHaveBeenCalledWith('user1');
      
      // Check that modal was closed
      expect(mockSetOpen).toHaveBeenCalledWith(false);
      
      // Check success notification was shown
      expect(Notiflix.Notify.success).toHaveBeenCalledWith('User removed successfully!');
    });
  });

  // Test API error handling
  test('handles API errors during user removal', async () => {
    // Mock axios to reject with an error
    const errorMessage = 'Failed to remove user';
    axios.delete.mockRejectedValueOnce({ 
      response: { data: { message: errorMessage } } 
    });
    
    render(
      <RemoveUser
        open={true}
        setOpen={mockSetOpen}
        serverId={mockServerId}
        serverUsers={mockServerUsers}
        updateUserList={mockUpdateUserList}
      />
    );
    
    // Select a user
    const selectElement = screen.getByRole('combobox');
    userEvent.selectOptions(selectElement, 'user1');
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Remove User/i });
    fireEvent.click(submitButton);
    
    // Wait for async operations
    await waitFor(() => {
      // Check that failure notification was shown with correct message
      expect(Notiflix.Notify.failure).toHaveBeenCalledWith(errorMessage);
      
      // Check that modal was not closed on error
      expect(mockSetOpen).not.toHaveBeenCalledWith(false);
    });
  });

  // Test manual modal closing behavior
  test('closes modal when cancel button is clicked', () => {
    render(
      <RemoveUser
        open={true}
        setOpen={mockSetOpen}
        serverId={mockServerId}
        serverUsers={mockServerUsers}
        updateUserList={mockUpdateUserList}
      />
    );
    
    // Click the cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    // Check that setOpen was called with false
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  test('closes modal when X button is clicked', () => {
    render(
      <RemoveUser
        open={true}
        setOpen={mockSetOpen}
        serverId={mockServerId}
        serverUsers={mockServerUsers}
        updateUserList={mockUpdateUserList}
      />
    );
    
    // Click the close (X) button
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);
    
    // Check that setOpen was called with false
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});