// src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import crmLogo from '../images/Logo.png';
import Notiflix from 'notiflix';


function CRMLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const CRM_API_URL = process.env.REACT_APP_CRM_API_URL;
  const API_KEY = process.env.REACT_APP_API_KEY;

  const handleLogin = async (event) => {
    event.preventDefault(); // Prevent default GET request
    try {
      const res = await axios.post(`${CRM_API_URL}/auth/login`, {
        "username": username,
        "password": password
      }, 
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY // Include the API Key
        }
      }); 

      // Save token in localStorage
      localStorage.setItem('token', res.data.token);
      // Redirect or navigate to crm page
      window.location.href = '/crm';
    } catch (error) {
      alert('Login failed');
      console.error('Login error:', error);
    }
  };

  const forgotPassword = () =>{
    Notiflix.Notify.info(
      'Too bad! 🤷' 
    );
  };
                      


  return (
      <div className="flex h-screen flex-1 flex-col justify-center items-center bg-primary px-6 py-12 lg:px-8">

        <div className="sm:mx-auto w-full max-w-sm sm:max-w-sm md:max-w-md lg:max-w-lg">
          <img
            alt="RenoSync CRM Logo"
            src={crmLogo}
            className="mx-auto w-auto" //h-28 md:h-36 lg:h-48 xl:h-48 
          />
        </div>

        <div className="mt-8 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl">
          <form id="loginForm" onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm/6 font-medium text-white">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm/6 font-medium text-white">
                  Password
                </label>
                <div className="text-sm" onClick={forgotPassword}>
                  <a href="#" className="font-semibold text-gray-300 hover:text-gray-500">
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
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 sm:text-sm/6"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <div className='flex justify-center items-center '>
              <button
                type="submit"
                className="flex w-2/4 justify-center rounded-md bg-blue-800 px-3 mt-4 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Log in
              </button>
            </div>
          </form>

        </div>
      </div>
  )
}

export default CRMLogin;
