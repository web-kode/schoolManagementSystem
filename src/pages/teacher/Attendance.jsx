"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Attendance = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceDate, setAttendanceDate] = useState('');
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Format today's date as YYYY-MM-DD for the date input
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        setAttendanceDate(formattedDate);

        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass && attendanceDate) {
            fetchStudentsAndAttendance();
        }
    }, [selectedClass, attendanceDate]);

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

    const fetchStudentsAndAttendance = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');

            // Fetch students in the class
            const studentsResponse = await axios.get(`/api/teachers/classes/${selectedClass}/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Try to fetch existing attendance for the selected date
            try {
                const attendanceResponse = await axios.get(`/api/teachers/attendance/${selectedClass}/${attendanceDate}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Convert attendance data to a map for easy access
                const attendanceMap = {};
                attendanceResponse.data.forEach(record => {
                    attendanceMap[record.student] = record.present;
                });

                setAttendanceData(attendanceMap);
            } catch (err) {
                // If no attendance found, initialize with all students present
                const newAttendanceData = {};
                studentsResponse.data.forEach(student => {
                    newAttendanceData[student._id] = true;
                });
                setAttendanceData(newAttendanceData);
            }

            setStudents(studentsResponse.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load students or attendance data');
            setLoading(false);
        }
    };

    const handleAttendanceChange = (studentId, present) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: present
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const attendanceRecords = students.map(student => ({
                student: student._id,
                present: attendanceData[student._id] || false
            }));

            await axios.post('/api/teachers/attendance', {
                classId: selectedClass,
                date: attendanceDate,
                attendance: attendanceRecords
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccess('Attendance saved successfully');
        } catch (err) {
            setError('Failed to save attendance data');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout userType="teacher">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">Mark Attendance</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="class-select" className="block mb-2 font-medium">Select Class:</label>
                        <select
                            id="class-select"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                    <div>
                        <label htmlFor="attendance-date" className="block mb-2 font-medium">Date:</label>
                        <input
                            type="date"
                            id="attendance-date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                                            No students found in this class
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student) => (
                                        <tr key={student._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {student.rollNo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {student.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={attendanceData[student._id] || false}
                                                        onChange={(e) => handleAttendanceChange(student._id, e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    />
                                                    <span className="ml-2">
                                                        {attendanceData[student._id] ? 'Present' : 'Absent'}
                                                    </span>
                                                </label>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting || students.length === 0}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {submitting ? 'Saving...' : 'Save Attendance'}
                        </button>
                    </div>
                </form>
            )}
        </DashboardLayout>
    );
};

export default Attendance;