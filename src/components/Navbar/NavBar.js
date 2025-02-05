import React, { useState, useEffect } from 'react';
import NavLinks from '../Navbar/NavLinks';
import { HashLink } from 'react-router-hash-link';
import RenoSyncLogo from '../../images/LogoVariants/RenoSyncLogo1563_longVersion.png';


const NavBar = () => {
    const [top, setTop] = useState(!window.scrollY);
    const [isOpen, setisOpen] = React.useState(false);

    function handleClick() {
        setisOpen(!isOpen);
    }

    const closeMenu = () => {
        setisOpen(false);
    };

    useEffect(() => {
      const scrollHandler = () => {
        window.pageYOffset > 10 ? setTop(false) : setTop(true)
      };
      window.addEventListener('scroll', scrollHandler);
      return () => window.removeEventListener('scroll', scrollHandler);
    }, [top]);

    return (
        <nav className={`fixed top-0 w-full z-30 bg-primary shadow-lg transition duration-300 ease-in-out mb-16 ${!top && 'bg-primary shadow-lg'}`}>
            <div className="flex flex-row justify-between items-center py-2">
                <div className="flex flex-row justify-center mx-4 md:px-0 md:mx-12 items-center text-center font-semibold">
                    <HashLink smooth to="/#hero">
                        <img src={RenoSyncLogo} 
                        alt="RenoSync Logo"
                        className="h-12 md:h-14 lg:h-16 xl:h-20 mr-2" />
                    </HashLink>
                </div>
                <div className="group flex flex-col items-center">
                    <button className="p-4 rounded-lg lg:hidden text-secondary" onClick={handleClick}>
                        <svg className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            {isOpen && (
                            <path fillRule="evenodd" clipRule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                            )}
                            {!isOpen && (
                            <path fillRule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z" />
                            )}
                        </svg>
                    </button>

                    {/* Desktop Links */}
                    <div className='hidden space-x-6 lg:inline-block p-5 px-4'>
                        <NavLinks/>
                    </div>

                    {/* Mobile Menu */}
                    <div className={`absolute top-full duration-500 ease-in-out left-0 w-full h-auto bg-gradient-to-t from-black to-primary lg:hidden shadow-xl p-16 ${   // 
                        isOpen ? "opacity-100 top-full translate-y-0" : "duration-300 opacity-0 -translate-y-full pointer-events-none" } `}>

                        <div className='flex flex-col space-y-6 items-center'>
                            <NavLinks  closeMenu={closeMenu}/>
                        </div>                                                
                    </div>

                </div>
            </div>
        </nav>
    )
    
}


export default NavBar;
