"use client"
// src/components/login/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginForm = ({ userType }) => {
    const [formData, setState] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setState({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let endpoint = '';
            switch (userType) {
                case 'admin':
                    endpoint = '/api/admin/login';
                    break;
                case 'teacher':
                    endpoint = '/api/teachers/login';
                    break;
                case 'student':
                    endpoint = '/api/students/login';
                    break;
                default:
                    setError('Invalid user type');
                    setLoading(false);
                    return;
            }

            const response = await axios.post(endpoint, formData);

            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userType', userType);
                localStorage.setItem('userData', JSON.stringify(response.data.user));

                // Redirect to appropriate dashboard
                navigate(`/${userType}/dashboard`);
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-800 capitalize">
                {userType} Login
            </h2>

            {error && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;