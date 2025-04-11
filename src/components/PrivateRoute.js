// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import  PropTypes from 'prop-types';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  // If token doesn’t exist, redirect to /crmlogin
  return token ? children : <Navigate to="/crmlogin" />;
}

PrivateRoute.propTypes = {
  children: PropTypes.node, // or PropTypes.element
};

export default PrivateRoute;
