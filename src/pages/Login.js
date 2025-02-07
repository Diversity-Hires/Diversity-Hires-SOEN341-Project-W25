// src/pages/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';
import Logo from '../images/AnimatedLogo.gif';
import Notiflix from 'notiflix';

// imports for front-end access to Firebase DB
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";


function CRMLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const CRM_API_URL = process.env.REACT_APP_CRM_API_URL;
  const API_KEY = process.env.REACT_APP_API_KEY;


  // Configure firebase connection
  const firebaseConfig = {
    apiKey: "AIzaSyCK3SV2WKNAEB9OdXqd5fee6K0tUjYsw4w",
    authDomain: "chathaven-3b77a.firebaseapp.com",
    databaseURL: "https://chathaven-3b77a-default-rtdb.firebaseio.com",
    projectId: "chathaven-3b77a",
    storageBucket: "chathaven-3b77a.firebasestorage.app",
    messagingSenderId: "881824192229",
    appId: "1:881824192229:web:3a68105be061f49432e60c",
    measurementId: "G-6VMPWLPHQH"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);



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
      window.location.href = '/home';
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
      <div className="flex h-screen flex-1 flex-col justify-center items-center bg-gradient-to-tr from-cyan-200 via-purple-100 to-yellow-200 px-6 py-12 lg:px-8">

        <div className="sm:mx-auto w-full max-w-sm sm:max-w-sm md:max-w-md lg:max-w-lg">
          {/* <div className="absolute inset-0 bg-white/30 backdrop-blur-lg rounded-lg"></div> */}
          <img
            alt="Logo"
            src={Logo}
            className="mx-auto w-auto" //h-28 md:h-36 lg:h-48 xl:h-48 
          />
          
        </div>

        <div className="mt-8 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl">
          <form id="loginForm" onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-base/6 font-bold text-stone-400">
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-purple-600 sm:text-sm/6"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-base/6 font-bold text-stone-400">
                  Password
                </label>
                <div className="text-sm" onClick={forgotPassword}>
                  <a href="#" className="font-base text-stone-400 text-base hover:text-gray-500">
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
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-purple-600 sm:text-sm/6"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <div className='flex justify-center items-center '>
              <button
                type="submit"
                className="flex w-2/4 justify-center rounded-md bg-primary px-3 mt-4 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-purple-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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
