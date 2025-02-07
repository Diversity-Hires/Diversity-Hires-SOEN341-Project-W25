// src/pages/Login.js
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import Logo from '../images/AnimatedLogo.gif';

function CRMLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // Store token locally
      localStorage.setItem("token", idToken);

      // Redirect to home page
      window.location.href = "/home"; 
    } catch (error) {
      alert("Login failed: " + error.message);
      console.error("Firebase Login Error:", error);
    }
  };

  const forgotPassword = async () => {
    if (!email) {
      alert("Please enter your email first.");
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      alert("Error: " + error.message);
      console.error("Password Reset Error:", error);
    }
  };

  return (
      <div className="flex h-screen flex-1 flex-col justify-center items-center bg-gradient-to-tr from-cyan-200 via-purple-100 to-yellow-200 px-6 py-12 lg:px-8">

        <div className="sm:mx-auto w-full max-w-sm">
          <img alt="Logo" src={Logo} className="mx-auto w-auto" />
        </div>

        <div className="mt-8 w-full max-w-md">
          <form id="loginForm" onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-base font-bold text-stone-400">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline outline-1 outline-gray-400 focus:outline-2 focus:outline-purple-600"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-base font-bold text-stone-400">
                  Password
                </label>
                <div className="text-sm" onClick={forgotPassword}>
                  <a href="#" className="text-base text-stone-400 hover:text-gray-500">
                    Forgot password?
                  </a>
                </div>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline outline-1 outline-gray-400 focus:outline-2 focus:outline-purple-600"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>

            <button type="submit" className="w-full rounded-md bg-primary px-3 py-1.5 text-white hover:bg-purple-400">
              Log in
            </button>
          </form>
        </div>
      </div>
  );
}

export default CRMLogin;