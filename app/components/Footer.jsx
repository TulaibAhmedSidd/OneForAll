import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 py-6 mt-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <p className="text-sm">&copy; {new Date().getFullYear()} OneForAll. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-blue-600" aria-label="Facebook">
            <FaFacebook />
          </a>
          <a href="#" className="hover:text-blue-600" aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="#" className="hover:text-blue-600" aria-label="Instagram">
            <FaInstagram />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
