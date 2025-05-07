"use client"

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, icon, children, isActive }) => {
    return (
        <Link
            to={to}
            className={`flex items-center px-4 py-3 text-gray-600 transition-colors duration-200 ${isActive ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-700' : 'hover:bg-gray-100'
                }`}
        >
            <span className="text-lg mr-3">{icon}</span>
            <span>{children}</span>
        </Link>
    );
};

const Sidebar = ({ userType }) => {
    const location = useLocation();

    // Define navigation links based on user type
    const getNavLinks = () => {
        switch (userType) {
            case 'admin':
                return [
                    { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
                    { to: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
                    { to: '/admin/students', label: 'Students', icon: '👨‍🎓' },
                    { to: '/admin/classes', label: 'Classes', icon: '🏫' },
                    { to: '/admin/subjects', label: 'Subjects', icon: '📚' },
                    { to: '/admin/notices', label: 'Notices', icon: '📢' },
                ];
            case 'teacher':
                return [
                    { to: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
                    { to: '/teacher/students', label: 'Students', icon: '👨‍🎓' },
                    { to: '/teacher/attendance', label: 'Attendance', icon: '📋' },
                    { to: '/teacher/grades', label: 'Grades', icon: '🎯' },
                    { to: '/teacher/notices', label: 'Notices', icon: '📢' },
                ];
            case 'student':
                return [
                    { to: '/student/dashboard', label: 'Dashboard', icon: '📊' },
                    { to: '/student/courses', label: 'Courses', icon: '📚' },
                    { to: '/student/grades', label: 'Grades', icon: '🎯' },
                    { to: '/student/attendance', label: 'Attendance', icon: '📋' },
                    { to: '/student/notices', label: 'Notices', icon: '📢' },
                ];
            default:
                return [];
        }
    };

    const navLinks = getNavLinks();

    return (
        <div className="w-64 h-full bg-white border-r border-gray-200">
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
                <h2 className="text-xl font-bold">{userType.charAt(0).toUpperCase() + userType.slice(1)} Portal</h2>
            </div>

            <div className="py-4">
                {navLinks.map((link) => (
                    <NavItem
                        key={link.to}
                        to={link.to}
                        icon={link.icon}
                        isActive={location.pathname === link.to}
                    >
                        {link.label}
                    </NavItem>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;