"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [classes, setClasses] = useState([]);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchStudents(selectedClass);
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/teachers/classes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(response.data);

            if (response.data.length > 0) {
                setSelectedClass(response.data[0]._id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            setError('Failed to load classes');
            setLoading(false);
        }
    };

    const fetchStudents = async (classId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/teachers/classes/${classId}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load students');
            setLoading(false);
        }
    };

    return (
        <DashboardLayout userType="teacher">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">Students</h1>

                <div className="flex items-center mb-4">
                    <label htmlFor="class-select" className="mr-2 font-medium">Select Class:</label>
                    <select
                        id="class-select"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {classes.map((cls) => (
                            <option key={cls._id} value={cls._id}>
                                {cls.name}
                            </option>
                        ))}
                        {classes.length === 0 && (
                            <option value="">No classes available</option>
                        )}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No students found in this class
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.rollNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.contact || 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Students;