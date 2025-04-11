import React, { useLayoutEffect } from "react";
import PropTypes from 'prop-types';
import { useLocation } from "react-router-dom";

function ScrollToTop({ children }) {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return <>{children}</>;
}

// Add prop types for `children`
ScrollToTop.propTypes = {
  children: PropTypes.node,
};

export default ScrollToTop;