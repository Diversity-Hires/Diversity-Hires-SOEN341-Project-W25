import React, { useEffect } from 'react';
import TagManager from 'react-gtm-module';
import AOS from 'aos';
import "aos/dist/aos.css";
import './index.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';
// All pages
import Login from './pages/Login';
import Home from './pages/Home';

import PrivateRoute from './components/PrivateRoute';
import {useDocTitle} from './components/CustomHook';
import ScrollToTop from './components/ScrollToTop';

function App() {
  useEffect(() => {
    const aos_init = () => {
      AOS.init({
        once: true,
        duration: 1000,
        easing: 'ease-out-cubic',
      });
    }

    window.addEventListener('load', () => {
      aos_init();
    });
  
  }, []);


  useDocTitle("ChatHaven");

  return (
    <>
      <Router>
        <ScrollToTop>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </ScrollToTop>
      </Router>
    </>
  );
}


{/* <Route
path="/crm"
element={
  <PrivateRoute>
    <LeadsTable />
  </PrivateRoute>
}
/> */}


export default App;
