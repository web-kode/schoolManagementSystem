"use client"

import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ userType, children }) => {
    const token = localStorage.getItem('token');
    const storedUserType = localStorage.getItem('userType');

    // If not authenticated or wrong user type, redirect to login
    if (!token || storedUserType !== userType) {
        return <Navigate to={`/${userType}/login`} />;
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar userType={userType} />

            <div className="flex flex-col flex-1 overflow-hidden">
                <Header userType={userType} />

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;