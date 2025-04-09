import React from 'react';
import Link from 'next/link';
import { FaHome,  FaUser, FaSignInAlt, FaUserPlus, FaGamepad, FaCreativeCommonsSampling } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex justify-between items-center p-4 text-blue-700 dark:text-blue-400">
        <div className="text-2xl font-bold">
          <Link href="/">OneForAll</Link>
        </div>
        <ul className="flex space-x-6 text-lg">
          <li className="flex items-center space-x-1 hover:text-blue-500">
            <FaHome /> <Link href="/">Home</Link>
          </li>
          <li className="flex items-center space-x-1 hover:text-blue-500">
            <FaGamepad /> <Link href="/dashboard">Dashboard</Link>
          </li>
          <li className="flex items-center space-x-1 hover:text-blue-500">
            <FaSignInAlt /> <Link href="/auth/login">Login</Link>
          </li>
          <li className="flex items-center space-x-1 hover:text-blue-500">
            <FaUserPlus /> <Link href="/auth/register">Register</Link>
          </li>
          <li className="flex items-center space-x-1 hover:text-blue-500">
            <FaUserPlus /> <Link href="/game/create">Create Game</Link>
          </li>
          <li className="flex items-center space-x-1 hover:text-blue-500">
            <FaCreativeCommonsSampling /> <Link href="/game">Game Management</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;