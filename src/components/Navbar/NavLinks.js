import React from 'react';
import { HashLink } from 'react-router-hash-link';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Import useTranslation hook

const NavLinks = ({closeMenu}) => {
    const { i18n, t} = useTranslation(); // Access i18n and t instance

     // Function to toggle the language
    const toggleLanguage = () => {
        const newLanguage = i18n.language === 'en' ? 'fr' : 'en';
        i18n.changeLanguage(newLanguage);
        localStorage.setItem('lang', newLanguage); // Persist language preference
        if (closeMenu) closeMenu(); // Call closeMenu if it exists
    };

    return (
        <>
            <HashLink className="text-base px-3 font-extrabold text-secondary hover:text-gray-400" smooth to="/#about" onClick={closeMenu}>
                {t('navbar.about')}
            </HashLink>

            <HashLink className="text-base px-3 font-extrabold text-secondary hover:text-gray-400" smooth to="/#services" onClick={closeMenu}>
                {t('navbar.services')}
            </HashLink>

            <HashLink className="text-base px-3 font-extrabold text-secondary hover:text-gray-400" smooth to="/#portfolio" onClick={closeMenu}>
                {t('navbar.portfolio')}
            </HashLink>

            {/* <Link className="text-base px-3 font-extrabold text-secondary hover:text-gray-400" smooth to="/contact">
                {t('navbar.contractor')}
            </Link>  */}

            {/* Language Switcher */}
            <button 
                onClick={toggleLanguage}
                className="text-base w-8 font-bold text-secondary hover:underline hover:text-gray-400"
            >
                {i18n.language === 'en' ? 'FR' : 'EN'}
            </button>

            <HashLink className="text-primary bg-secondary hover:bg-gray-300 inline-flex items-center justify-center w-auto px-5 py-3 shadow-xl rounded-lg" smooth to="/form" onClick={closeMenu}>
                {t('navbar.form')}
            </HashLink>

            
            

        </>
    )
}

export default NavLinks;
