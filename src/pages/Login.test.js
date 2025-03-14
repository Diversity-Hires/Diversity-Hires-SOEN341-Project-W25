// Login.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Notiflix from 'notiflix';
import '@testing-library/jest-dom/extend-expect'; // ensures toBeInTheDocument and others are available
import Login from './Login';

// Mock axios and Notiflix
jest.mock('axios');
jest.mock('notiflix');

// Override window.location so we can test redirection
delete window.location;
window.location = { href: '' };

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    window.location.href = '';
  });

  test('renders username and password inputs and the "Log in" button', () => {
    render(<Login />);
    // Check that username and password fields are rendered
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    // Check that the Log in button is present
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('valid credentials → redirects, token stored, success path', async () => {
    // Mock a successful axios response
    axios.post.mockResolvedValueOnce({
      data: { token: 'fake-jwt-token' }
    });

    render(<Login />);

    // Simulate entering valid credentials
    await userEvent.type(screen.getByLabelText(/username/i), 'validUser');
    await userEvent.type(screen.getByLabelText(/password/i), 'validPass');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Wait for axios.post to be called with the proper arguments
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        { username: 'validUser', password: 'validPass' },
        expect.any(Object) // headers object
      );
    });

    // Wait for token to be stored in localStorage
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    });

    // And wait for redirection to occur
    await waitFor(() => {
      expect(window.location.href).toBe('/home');
    });
  });

  test('invalid credentials → displays error and does not store token', async () => {
    // Mock a failed response; include a response object to simulate axios error structure
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });

    render(<Login />);

    // Simulate entering invalid credentials
    await userEvent.type(screen.getByLabelText(/username/i), 'wrongUser');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongPass');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Wait for Notiflix.Notify.failure to be called with the expected message
    await waitFor(() => {
      expect(Notiflix.Notify.failure).toHaveBeenCalledWith(
        'Login failed: Invalid Credentials!'
      );
    });

    // Ensure no token is stored and no redirection occurs
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('');
  });

  test('empty fields → prompts user to fill in username/password', async () => {
    render(<Login />);

    // Simulate clicking "Log in" with empty fields
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Instead of expecting no axios call, we now expect our component to notify the user.
    // Adjust the expected message if your Login.js uses a different string.
    await waitFor(() => {
      expect(Notiflix.Notify.failure).toHaveBeenCalledWith(
        'Please fill in username and password!'
      );
    });

    // Optionally, ensure axios.post was not called (if your form prevents submission)
    expect(axios.post).not.toHaveBeenCalled();
  });
});