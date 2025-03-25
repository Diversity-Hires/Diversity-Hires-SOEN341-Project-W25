import React, { useState } from 'react';
import axios from 'axios';
import Logo from '../images/AnimatedLogo.gif';
import Notiflix from 'notiflix';
import RegistrationPopUp from '../components/Registration';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;
  const API_KEY = process.env.REACT_APP_API_KEY;

  const handleRegistration = () => {
    setOpenDialog(true);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    // Explicitly check for empty fields
    if (!username.trim() || !password.trim()) {
      Notiflix.Notify.failure("Please fill in username and password!");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`,
        { username, password },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY
          }
        }
      );

      // Save token in localStorage
      localStorage.setItem('token', res.data.token);
      // Redirect or navigate to home page
      window.location.href = '/home';
    } catch (error) {
      Notiflix.Notify.failure("Login failed: Invalid Credentials!");
      console.error('Login error:', error);
    }
  };

  const forgotPassword = () => {
    Notiflix.Notify.info('Too bad! 🤷');
  };

  return (
    <div className="flex h-screen flex-1 flex-col justify-center items-center bg-gradient-to-tr from-cyan-200 via-purple-100 to-yellow-200 px-6 py-12 lg:px-8">
      <div className="sm:mx-auto w-full max-w-sm sm:max-w-sm md:max-w-md lg:max-w-lg">
        <img
          alt="Logo"
          src={Logo}
          className="mx-auto w-auto"
        />
      </div>

      <div className="mt-8 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl">
        <form id="loginForm" onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-base/6 font-medium text-stone-400">
              Username
            </label>
            <div className="mt-2">
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-indigo-800 outline outline-1 -outline-offset-1 outline-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-purple-600 sm:text-sm/6"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-base/6 font-medium text-stone-400">
                Password
              </label>
              <div className="text-sm" onClick={forgotPassword}>
                <a href="#" className="text-stone-400 text-base hover:text-gray-500">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-indigo-800 outline outline-1 -outline-offset-1 outline-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-purple-600 sm:text-sm/6"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className='flex justify-center items-center'>
            <div className="flex flex-col items-center w-full space-y-6 mt-2">
              <button
                type="submit"
                className="w-2/4 justify-center rounded-md bg-purple-400 px-4 py-2 text-base font-medium text-white shadow-md hover:bg-pink-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-pink-500"
              >
                Log in
              </button>
              <button
                type="button"
                className="w-1/4 justify-center rounded-md bg-blue-400 px-4 py-2 text-base font-medium text-white shadow-md hover:bg-blue-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-blue-500"
                onClick={() => handleRegistration()}
              >
                Register
              </button>
            </div>
          </div>
        </form>
      </div>

      <RegistrationPopUp
        open={openDialog}
        setOpen={setOpenDialog}
        user={username}
        pass={password}
      />
    </div>
  );
}

export default Login;