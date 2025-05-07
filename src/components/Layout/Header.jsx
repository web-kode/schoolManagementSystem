"use client"

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ userType }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userName = userData.name || `${userType}`;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        localStorage.removeItem('userData');
        navigate('/');
    };

    return (
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="text-lg font-bold">School Management System</div>

            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center focus:outline-none"
                >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="mr-1">{userName}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;