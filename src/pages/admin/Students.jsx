"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StudentForm from '../../components/admin/StudentForm';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/admin/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load students');
            setLoading(false);
        }
    };

    const handleAddStudent = () => {
        setEditingStudent(null);
        setShowAddModal(true);
    };

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setShowAddModal(true);
    };

    const handleDeleteStudent = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/admin/students/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchStudents();
            } catch (err) {
                setError('Failed to delete student');
            }
        }
    };

    const handleFormClose = () => {
        setShowAddModal(false);
        setEditingStudent(null);
    };

    const handleFormSubmit = async (formData) => {
        try {
            const token = localStorage.getItem('token');

            if (editingStudent) {
                await axios.put(`/api/admin/students/${editingStudent._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/admin/students', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            fetchStudents();
            handleFormClose();
        } catch (err) {
            setError('Failed to save student');
        }
    };

    return (
        <DashboardLayout userType="admin">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Students</h1>
                <button
                    onClick={handleAddStudent}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Add Student
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No students found
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.class?.name || 'Not assigned'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {student.rollNo}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleEditStudent(student)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student._id)}
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
                <StudentForm
                    isOpen={showAddModal}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    student={editingStudent}
                />
            )}
        </DashboardLayout>
    );
};

export default Students;