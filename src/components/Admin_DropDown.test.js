import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // for extra Jest matchers
import axios from 'axios';
import Notiflix from 'notiflix';
import AdminDropdown from './Admin_DropDown'; // <-- adjust path if needed

jest.mock('axios');    // mock axios calls
jest.mock('notiflix'); // mock Notiflix notifications

describe('AdminDropdown Delete Messages', () => {
  const mockSetOpen = jest.fn();
  const mockHandleDeleteModeToggle = jest.fn();
  const mockHandleMessageSelect = jest.fn();
  const mockOpenChangeRole = jest.fn();

  // Helper to render the component in different states
  const renderDropdown = (props = {}) => {
    // Default props
    const defaultProps = {
      open: true,
      setOpen: mockSetOpen,
      buttonRef: { current: document.createElement('button') },
      deleteMessages: jest.fn(),
      selectedMessages: [],
      isDeleteMode: false,
      handleMessageSelect: mockHandleMessageSelect,
      handleDeleteModeToggle: mockHandleDeleteModeToggle,
      serverId: 'testServerId',
      openChangeRole: mockOpenChangeRole,
      ...props, // allow overriding defaults
    };
    return render(<AdminDropdown {...defaultProps} />);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders "Delete Messages" button when isDeleteMode is false', () => {
    renderDropdown({ isDeleteMode: false });
    const deleteBtn = screen.getByText('Delete Messages');
    expect(deleteBtn).toBeInTheDocument();
  });

  test('toggles to delete mode when "Delete Messages" is clicked', () => {
    renderDropdown({ isDeleteMode: false });
    const deleteBtn = screen.getByText('Delete Messages');

    fireEvent.click(deleteBtn);
    expect(mockHandleDeleteModeToggle).toHaveBeenCalledTimes(1);
  });

  test('disables "Delete Selected" button when no messages are selected', () => {
    renderDropdown({ isDeleteMode: true, selectedMessages: [] });
    const deleteSelectedBtn = screen.getByText('Delete Selected');
    expect(deleteSelectedBtn).toBeDisabled();
  });

  test('enables "Delete Selected" button when messages are selected', () => {
    renderDropdown({ isDeleteMode: true, selectedMessages: [1, 2] });
    const deleteSelectedBtn = screen.getByText('Delete Selected');
    expect(deleteSelectedBtn).not.toBeDisabled();
  });

  test('calls axios.delete and shows success notification on successful deletion', async () => {
    // Mock success response from axios
    axios.delete.mockResolvedValueOnce({ data: {} });

    // We pass in a real deleteMessages function, or test it inline
    const deleteMessages = async () => {
      try {
        await axios.delete('/servers/messages', { data: { serverId: 'testServerId', selectedMessages: [1, 2] } });
        Notiflix.Notify.success('Messages deleted successfully');
      } catch (error) {
        Notiflix.Notify.failure('Failed to delete messages');
      }
    };

    renderDropdown({
      isDeleteMode: true,
      selectedMessages: [1, 2],
      deleteMessages,
    });

    // Click "Delete Selected"
    fireEvent.click(screen.getByText('Delete Selected'));
    // Click "Yes" on the confirm delete
    fireEvent.click(screen.getByText('Yes'));

    // Wait for the async code
    await waitFor(() => {
      // axios.delete should have been called
      expect(axios.delete).toHaveBeenCalledWith('/servers/messages', {
        data: { serverId: 'testServerId', selectedMessages: [1, 2] },
      });
      // Notiflix success message should have been shown
      expect(Notiflix.Notify.success).toHaveBeenCalledWith('Messages deleted successfully');
    });
  });

  test('shows failure notification on deletion error', async () => {
    // Mock a failed response from axios
    axios.delete.mockRejectedValueOnce(new Error('Some error'));

    const deleteMessages = async () => {
      try {
        await axios.delete('/servers/messages', { data: { serverId: 'testServerId', selectedMessages: [123] } });
        Notiflix.Notify.success('Messages deleted successfully');
      } catch (error) {
        Notiflix.Notify.failure('Failed to delete messages');
      }
    };

    renderDropdown({
      isDeleteMode: true,
      selectedMessages: [123],
      deleteMessages,
    });

    // Click "Delete Selected"
    fireEvent.click(screen.getByText('Delete Selected'));
    // Click "Yes" on the confirm delete
    fireEvent.click(screen.getByText('Yes'));

    // Wait for the async code
    await waitFor(() => {
      // Notiflix failure message should have been shown
      expect(Notiflix.Notify.failure).toHaveBeenCalledWith('Failed to delete messages');
    });
  });
});
