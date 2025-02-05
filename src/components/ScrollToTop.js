import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = (props) => {
    const {pathname} = useLocation();

    useLayoutEffect(() => {
      // Prevent browser from preserving scroll position
      if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'manual';
      }

      // Scroll instantly to the top
      window.scrollTo(0, 0);
  }, [pathname]);
  
    return <>
        {props.children}
    </>
    
  };

export default ScrollToTop;
