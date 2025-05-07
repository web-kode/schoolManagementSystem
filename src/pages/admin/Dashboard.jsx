"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import RecentNotices from '../../components/dashboard/RecentNotices';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        totalClasses: 0,
        totalSubjects: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');

                const response = await axios.get('/api/admin/dashboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setStats({
                    totalStudents: response.data.totalStudents || 0,
                    totalTeachers: response.data.totalTeachers || 0,
                    totalClasses: response.data.totalClasses || 0,
                    totalSubjects: response.data.totalSubjects || 0
                });
            } catch (err) {
                setError('Failed to load dashboard data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <DashboardLayout userType="admin">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Total Students" value={stats.totalStudents} icon="👨‍🎓" color="bg-blue-500" />
                        <StatCard title="Total Teachers" value={stats.totalTeachers} icon="👨‍🏫" color="bg-green-500" />
                        <StatCard title="Total Classes" value={stats.totalClasses} icon="🏫" color="bg-yellow-500" />
                        <StatCard title="Total Subjects" value={stats.totalSubjects} icon="📚" color="bg-purple-500" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
                            <div className="border-t pt-4">
                                <p className="text-gray-500">No recent activities to display</p>
                            </div>
                        </div>

                        <RecentNotices />
                    </div>
                </>
            )}
        </DashboardLayout>
    );
};

export default AdminDashboard;