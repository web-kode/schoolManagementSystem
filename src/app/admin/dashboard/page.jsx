"use client"
import React, { useState, useEffect } from "react";
import { Users, UserCheck, BookOpen, Activity, Calendar, AlertCircle, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import axios from "axios";
import { getApi } from "../../../components/apiClient.js";

// Today's attendance data from API response
const todayAttendanceData = {
    date: "2025-05-08",
    type: "daily",
    schoolSummary: {
        totalStudents: 13,
        present: 6,
        absent: 4,
        leave: 2,
        notMarked: 1,
        attendancePercentage: 100
    },
    classSummaries: [
        {
            _id: "6804df068f813612b36b0e0f",
            name: "10A",
            class: 10,
            section: "A",
            totalStudents: 0,
            present: 0,
            absent: 0,
            leave: 0,
            notMarked: 0,
            attendancePercentage: 0,
            attendanceRecords: 0
        },
        {
            _id: "6804df218f813612b36b0e15",
            name: "10B",
            class: 10,
            section: "B",
            totalStudents: 0,
            present: 0,
            absent: 0,
            leave: 0,
            notMarked: 0,
            attendancePercentage: 0,
            attendanceRecords: 0
        },
        {
            _id: "680679b0b9064b28378e194f",
            name: "10C",
            class: 10,
            section: "C",
            totalStudents: 3,
            present: 0,
            absent: 0,
            leave: 0,
            notMarked: 3,
            attendancePercentage: 0,
            attendanceRecords: 0
        },
        {
            _id: "680679b0b9064b28378e194f",
            name: "9A",
            class: 10,
            section: "C",
            totalStudents: 3,
            present: 0,
            absent: 0,
            leave: 0,
            notMarked: 3,
            attendancePercentage: 0,
            attendanceRecords: 0
        },
        {
            _id: "680679b0b9064b28378e194f",
            name: "9B",
            class: 10,
            section: "C",
            totalStudents: 3,
            present: 0,
            absent: 0,
            leave: 0,
            notMarked: 3,
            attendancePercentage: 0,
            attendanceRecords: 0
        },
        {
            _id: "680679b0b9064b28378e194f",
            name: "9C",
            class: 10,
            section: "C",
            totalStudents: 3,
            present: 0,
            absent: 0,
            leave: 0,
            notMarked: 3,
            attendancePercentage: 0,
            attendanceRecords: 0
        }
    ]
};

// Mock data for previous days to show in chart
// const previousDaysData = [
//     { date: "May 03", attendancePercentage: 92 },
//     { date: "May 04", attendancePercentage: 88 },
//     { date: "May 05", attendancePercentage: 95 },
//     { date: "May 06", attendancePercentage: 91 },
//     { date: "May 07", attendancePercentage: 89 },
//     { date: "May 08", attendancePercentage: todayAttendanceData.schoolSummary.attendancePercentage || 0 },
// ];

// Upcoming events
const upcomingEvents = [
    { id: 1, title: "Annual Sports Day", date: "May 15, 2025", type: "event" },
    { id: 2, title: "Science Exhibition", date: "May 20, 2025", type: "academic" },
    { id: 3, title: "Parent-Teacher Meeting", date: "May 25, 2025", type: "meeting" },
];

// Pending requests
const pendingRequests = [
    { id: 1, type: "Leave", from: "Teacher Smith", status: "Pending" },
    { id: 2, type: "Document", from: "Student Johnson", status: "Pending" },
    { id: 3, type: "Transfer", from: "Student Williams", status: "Review" },
];

export default function DashboardPage() {
    const [selectedClass, setSelectedClass] = useState(null);
    const [dashboardData, setDashboardData] = useState({
        date: '',
        totalCounts: {
            classCount: 0,
            percentage: "0.00",
            studentCount: 0,
            teacherCount: 0
        },
        attendances: {
            totalPresent: 0,
            totalLeave: 0,
            totalAbsent: 0,
            totalNotMarked: 0,
        },
        results: [{ date: "", percentage: "" }],
        attendanceResults: []
    })

    // get dashboard data on refresh
    useEffect(() => {
        async function fetchData() {
            try {
                const url = `/api/admin/dashboard-data`
                const response = await getApi(url)
                setDashboardData({
                    date: response.date,
                    totalCounts: {
                        ...response.totalCounts
                    },
                    attendances: {
                        ...response.attendances
                    },
                    results: response.results,
                    attendanceResults: response.attendanceResults
                });
            } catch (error) {
                console.log("Dashboard Data Error :: ", error)
            }
        }
        fetchData()
    }, []);

    // Format attendance status data for pie chart
    const formatAttendanceForPieChart = (data) => {
        return [
            { name: "Present", value: data.totalPresent, color: "#4CAF50" },
            { name: "Absent", value: data.totalAbsent, color: "#F44336" },
            { name: "Leave", value: data.totalLeave, color: "#FFC107" },
            { name: "Not Marked", value: data.totalNotMarked, color: "#9E9E9E" }
        ].filter(item => item.value > 0);
    };
    const schoolAttendancePieData = formatAttendanceForPieChart(dashboardData.attendances);

    // Handle class selection
    const handleClassClick = (className) => {
        setSelectedClass(selectedClass === className ? null : className);
    };

    // Get selected class data
    const selectedClassData = selectedClass ? todayAttendanceData.classSummaries.find(cls => cls.name === selectedClass) : null;

    return (
        <div className="bg-gray-50 p-6 text-gray-600">
            {/* First Row - Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <Users className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm">Total Students</h3>
                        <p className="text-2xl font-bold">{dashboardData.totalCounts.studentCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                        <UserCheck className="text-green-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm">Total Teachers</h3>
                        <p className="text-2xl font-bold">{dashboardData.totalCounts.teacherCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="bg-indigo-100 p-3 rounded-full mr-4">
                        <BookOpen className="text-indigo-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm">Total Classes</h3>
                        <p className="text-2xl font-bold">{dashboardData.totalCounts.classCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full mr-4">
                        <Activity className="text-purple-600" size={20} />
                    </div>
                    <div>
                        <h3 className="text-gray-500 text-sm">Yesterday's Attendance</h3>
                        <p className="text-2xl font-bold">{dashboardData.totalCounts.percentage}</p>
                    </div>
                </div>
            </div>

            {/* Second Row - Attendance Overview (2 cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Today's Attendance Summary Card */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                            <Clock className="text-gray-500 mr-2" size={18} />
                            <h3 className="text-lg font-semibold">Yesterday's Attendance Overview</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{dashboardData.date}</p>
                    </div>
                    <div className="p-4">
                        <div className="h-64">
                            {schoolAttendancePieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={schoolAttendancePieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={2}
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {schoolAttendancePieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                        <Tooltip formatter={(value) => [value, "Students"]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <AlertTriangle size={40} className="mb-2 text-amber-500" />
                                    <p className="text-center">No attendance data recorded yet for today</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="bg-green-50 rounded p-3 text-center">
                                <div className="flex items-center justify-center mb-1">
                                    <CheckCircle size={16} className="text-green-600 mr-1" />
                                    <span className="font-medium text-green-700">Present</span>
                                </div>
                                <p className="text-xl font-bold text-green-700">{dashboardData.attendances.totalPresent}</p>
                            </div>
                            <div className="bg-red-50 rounded p-3 text-center">
                                <div className="flex items-center justify-center mb-1">
                                    <XCircle size={16} className="text-red-600 mr-1" />
                                    <span className="font-medium text-red-700">Absent</span>
                                </div>
                                <p className="text-xl font-bold text-red-700">{dashboardData.attendances.totalAbsent}</p>
                            </div>
                            <div className="bg-amber-50 rounded p-3 text-center">
                                <div className="flex items-center justify-center mb-1">
                                    <Calendar size={16} className="text-amber-600 mr-1" />
                                    <span className="font-medium text-amber-700">Leave</span>
                                </div>
                                <p className="text-xl font-bold text-amber-700">{dashboardData.attendances.totalLeave}</p>
                            </div>
                            <div className="bg-gray-100 rounded p-3 text-center">
                                <div className="flex items-center justify-center mb-1">
                                    <Clock size={16} className="text-gray-600 mr-1" />
                                    <span className="font-medium text-gray-700">Not Marked</span>
                                </div>
                                <p className="text-xl font-bold text-gray-700">{dashboardData.attendances.totalNotMarked}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Class-wise Attendance Status */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                            <BookOpen className="text-gray-500 mr-2" size={18} />
                            <h3 className="text-lg font-semibold">Class-wise Status</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{dashboardData.date}</p>
                    </div>

                    <div className="p-4">
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            {dashboardData.attendanceResults.length > 0 ? (
                                dashboardData.attendanceResults.map((classData) => {
                                    // Calculate attendance percentage
                                    const totalStudents = classData.present + classData.absent + classData.leave;
                                    const notMarked = classData.status === "Not Marked" ? totalStudents : 0;
                                    const attendancePercentage = totalStudents > 0
                                        ? Math.round((classData.present / totalStudents) * 100)
                                        : 0;

                                    return (
                                        <div
                                            key={classData.classId}
                                            className={`border border-[#ccc] rounded-lg p-3 cursor-pointer transition-all ${selectedClass === classData.className ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 hover:bg-gray-100'
                                                }`}
                                            onClick={() => handleClassClick(classData.className)}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <h5 className="font-medium">Class {classData.className}</h5>
                                                <span className={`text-sm font-semibold px-2 py-1 rounded-full ${classData.status === "Not Marked"
                                                        ? 'bg-gray-200 text-gray-700'
                                                        : attendancePercentage > 90
                                                            ? 'bg-green-100 text-green-700'
                                                            : attendancePercentage > 75
                                                                ? 'bg-blue-100 text-blue-600'
                                                                : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {classData.status === "Not Marked"
                                                        ? 'Not Marked'
                                                        : `${attendancePercentage}%`
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Total: {totalStudents}</span>
                                                <div className="flex space-x-2">
                                                    <span className="text-green-600">P: {classData.present}</span>
                                                    <span className="text-red-600">A: {classData.absent}</span>
                                                    <span className="text-amber-600">L: {classData.leave}</span>
                                                </div>
                                            </div>

                                            {/* Progress bar to visualize attendance */}
                                            {totalStudents > 0 && (
                                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                    <div className="flex">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-l-full"
                                                            style={{ width: `${(classData.present / totalStudents) * 100}%` }}
                                                        ></div>
                                                        <div
                                                            className="bg-red-500 h-2"
                                                            style={{ width: `${(classData.absent / totalStudents) * 100}%` }}
                                                        ></div>
                                                        <div
                                                            className="bg-amber-500 h-2"
                                                            style={{ width: `${(classData.leave / totalStudents) * 100}%` }}
                                                        ></div>
                                                        {notMarked > 0 && (
                                                            <div
                                                                className="bg-gray-400 h-2 rounded-r-full"
                                                                style={{ width: `${(notMarked / totalStudents) * 100}%` }}
                                                            ></div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                    <AlertCircle size={40} className="mb-2" />
                                    <p>No class data available</p>
                                </div>
                            )}
                        </div>

                        {/* Class details when a class is selected */}
                        {selectedClass && selectedClassData && (() => {
                            const totalStudents = selectedClassData.present + selectedClassData.absent + selectedClassData.leave;
                            const notMarked = selectedClassData.status === "Not Marked" ? totalStudents : 0;
                            const attendancePercentage = totalStudents > 0
                                ? Math.round((selectedClassData.present / totalStudents) * 100)
                                : 0;

                            return (
                                <div className="mt-4 border-t pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-semibold text-md text-gray-700">
                                            {selectedClass} Details
                                        </h4>
                                        <button
                                            onClick={() => setSelectedClass(null)}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            Close
                                        </button>
                                    </div>

                                    <div className="bg-indigo-50 p-3 rounded-lg">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Students:</span>
                                                <span className="font-semibold">{totalStudents}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Attendance:</span>
                                                <span className="font-semibold">
                                                    {selectedClassData.status === "Not Marked"
                                                        ? "Not Marked"
                                                        : `${attendancePercentage}%`}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Present:</span>
                                                <span className="font-semibold text-green-700">{selectedClassData.present}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Absent:</span>
                                                <span className="font-semibold text-red-700">{selectedClassData.absent}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Leave:</span>
                                                <span className="font-semibold text-amber-700">{selectedClassData.leave}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Not Marked:</span>
                                                <span className="font-semibold text-gray-700">{notMarked}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Third Row - Weekly Attendance Trend (standalone) */}
            <div className="mb-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                            <Activity className="text-gray-500 mr-2" size={18} />
                            <h3 className="text-lg font-semibold">Weekly Attendance Trend</h3>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={dashboardData.results}
                                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        angle={-45}
                                        textAnchor="end"
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip fill='#155dfc' formatter={(value) => [`${value}%`, "Attendance"]} />
                                    <Bar
                                        dataKey="percentage"
                                        fill="#155dfc"
                                        radius={[4, 4, 0, 0]}
                                        name="Attendance"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fourth Row - Events and Requests */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Events */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                            <Calendar className="text-gray-500 mr-2" size={18} />
                            <h3 className="text-lg font-semibold">Upcoming Events</h3>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                                    <div className={`p-2 rounded-full mr-3 ${event.type === 'event' ? 'bg-purple-100 text-purple-600' :
                                        event.type === 'academic' ? 'bg-blue-100 text-blue-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                        <Calendar size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium">{event.title}</h4>
                                        <p className="text-sm text-gray-500">{event.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Pending Requests */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center">
                            <AlertCircle className="text-gray-500 mr-2" size={18} />
                            <h3 className="text-lg font-semibold">Pending Requests</h3>
                        </div>
                    </div>
                    <div className="p-4">
                        <div className="space-y-3">
                            {pendingRequests.map((request) => (
                                <div key={request.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-amber-100 text-amber-600 rounded-full mr-3">
                                            <AlertCircle size={16} />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{request.type} Request</h4>
                                            <p className="text-sm text-gray-500">From: {request.from}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${request.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                                        'bg-blue-100 text-blue-600'
                                        }`}>
                                        {request.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}