// ChangeRoleModal.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Notiflix from 'notiflix';
import ChangeRoleModal from './ChangeRoleModal'; // adjust to actual path

jest.mock('axios');
jest.mock('notiflix');

describe('ChangeRoleModal Component', () => {
  const mockSetOpen = jest.fn();
  const mockGetUpdatedRoles = jest.fn();
  const defaultServerUsers = [
    { username: 'alice', role: 'member' },
    { username: 'bob', role: 'admin' },
  ];

  const renderModal = (props = {}) => {
    // Default props
    const defaultProps = {
      open: true,
      setOpen: mockSetOpen,
      serverId: 'fakeServerId',
      serverUsers: defaultServerUsers,
      getUpdatedRoles: mockGetUpdatedRoles,
      ...props,
    };
    return render(<ChangeRoleModal {...defaultProps} />);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the modal when open is true', () => {
    renderModal();

    // Check headings, labels, or unique text
    expect(screen.getByText('Change User Role')).toBeInTheDocument();
    expect(screen.getByText('Select User')).toBeInTheDocument();
    expect(screen.getByText('Select New Role')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change role/i })).toBeInTheDocument();
  });

  test('closes the modal when clicking the X button', () => {
    renderModal();

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  test('calls axios.post and shows success notification on successful submission', async () => {
    axios.post.mockResolvedValueOnce({ data: {} });

    renderModal();

    // Select a user
    fireEvent.change(screen.getByLabelText('Select User'), { target: { value: 'alice' } });
    // Select a new role
    fireEvent.change(screen.getByLabelText('Select New Role'), { target: { value: 'admin' } });
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /change role/i }));

    await waitFor(() => {
      // We expect a POST to /servers/add-user with certain data
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/servers/add-user'),
        {
          serverId: 'fakeServerId',
          username: 'alice',
          role: 'admin',
        },
        expect.any(Object)
      );
      // Notiflix success should have been called
      expect(Notiflix.Notify.success).toHaveBeenCalledWith('User role changed successfully!');
      // getUpdatedRoles should have been called
      expect(mockGetUpdatedRoles).toHaveBeenCalled();
      // modal is closed
      expect(mockSetOpen).toHaveBeenCalledWith(false);
    });
  });

  test('shows failure notification on error', async () => {
    axios.post.mockRejectedValueOnce(new Error('Some error'));

    renderModal();

    // Select a user
    fireEvent.change(screen.getByLabelText('Select User'), { target: { value: 'bob' } });
    // Select a new role
    fireEvent.change(screen.getByLabelText('Select New Role'), { target: { value: 'member' } });
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /change role/i }));

    await waitFor(() => {
      expect(Notiflix.Notify.failure).toHaveBeenCalledWith('Failed to add user.');
      // setOpen won't be called with false on failure by default
      // (unless your code does so)
      expect(mockSetOpen).not.toHaveBeenCalledWith(false);
    });
  });

  test('clicking Cancel calls setOpen(false)', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });
});
