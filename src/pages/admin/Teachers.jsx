"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import TeacherForm from '../../components/admin/TeacherForm';

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/teachers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeachers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load teachers');
            setLoading(false);
        }
    };

    const handleAddTeacher = () => {
        setEditingTeacher(null);
        setShowAddModal(true);
    };

    const handleEditTeacher = (teacher) => {
        setEditingTeacher(teacher);
        setShowAddModal(true);
    };

    const handleDeleteTeacher = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/admin/teachers/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchTeachers();
            } catch (err) {
                setError('Failed to delete teacher');
            }
        }
    };

    const handleFormClose = () => {
        setShowAddModal(false);
        setEditingTeacher(null);
    };

    const handleFormSubmit = async (formData) => {
        try {
            const token = localStorage.getItem('token');

            if (editingTeacher) {
                await axios.put(`/api/admin/teachers/${editingTeacher._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/admin/teachers', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            fetchTeachers();
            handleFormClose();
        } catch (err) {
            setError('Failed to save teacher');
        }
    };

    return (
        <DashboardLayout userType="admin">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Teachers</h1>
                <button
                    onClick={handleAddTeacher}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Add Teacher
                </button>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No teachers found
                                    </td>
                                </tr>
                            ) : (
                                teachers.map((teacher) => (
                                    <tr key={teacher._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {teacher.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {teacher.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {teacher.subject?.name || 'Not assigned'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleEditTeacher(teacher)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTeacher(teacher._id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddModal && (
                <TeacherForm
                    isOpen={showAddModal}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    teacher={editingTeacher}
                />
            )}
        </DashboardLayout>
    );
};

export default Teachers;