"use client"

import React from 'react';
import LoginForm from '../components/login/LoginForm';

const TeacherLogin = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">School Management System</h1>
                    <p className="text-gray-600 mt-2">Teacher Portal</p>
                </div>
                <LoginForm userType="teacher" />
            </div>
        </div>
    );
};

export default TeacherLogin;