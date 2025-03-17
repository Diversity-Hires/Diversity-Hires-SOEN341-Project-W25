// Registration.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Notiflix from 'notiflix';
import Registration from './Registration';
import '@testing-library/jest-dom/extend-expect';

jest.mock('axios');
jest.mock('notiflix');

describe('RegistrationPopUp', () => {
  const setOpenMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration fields and "Register" button', () => {
    render(<Registration open={true} setOpen={setOpenMock} />);
    // Since the inputs are not wrapped with <label>, we access them by their id.
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    const registerButton = screen.getByRole('button', { name: /register/i });
    expect(registerButton).toBeInTheDocument();
  });

  test('submits valid registration data, shows success, and closes pop-up', async () => {
    // Mock a successful registration response (no additional message)
    axios.post.mockResolvedValueOnce({ data: { message: '' } });

    render(<Registration open={true} setOpen={setOpenMock} />);

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    await userEvent.type(usernameInput, 'newUser');
    await userEvent.type(passwordInput, 'newPassword');

    const registerButton = screen.getByRole('button', { name: /register/i });
    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        { username: 'newUser', password: 'newPassword' },
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(Notiflix.Notify.success).toHaveBeenCalledWith("Registration was successful. Please log in!");
    });

    await waitFor(() => {
      expect(setOpenMock).toHaveBeenCalledWith(false);
    });
  });

  test('shows error on invalid registration data', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Username already exists.' } }
    });

    render(<Registration open={true} setOpen={setOpenMock} />);

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    await userEvent.type(usernameInput, 'existingUser');
    await userEvent.type(passwordInput, 'somePassword');

    const registerButton = screen.getByRole('button', { name: /register/i });
    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(Notiflix.Notify.failure).toHaveBeenCalledWith('Username already exists.');
    });
  });

  test('empty fields → shows error and does not call axios', async () => {
    render(<Registration open={true} setOpen={setOpenMock} />);

    const registerButton = screen.getByRole('button', { name: /register/i });
    await userEvent.click(registerButton);

    await waitFor(() => {
      expect(Notiflix.Notify.failure).toHaveBeenCalledWith("Please fill out all required fields!");
    });

    // Expect that axios.post is not called when fields are empty.
    expect(axios.post).not.toHaveBeenCalled();
  });
});