"use client"
import { useState, useEffect } from 'react';
import { Search, Plus, Upload, Edit, Trash2, X } from 'lucide-react';

export default function ClassManagement() {
    const [classes, setClasses] = useState([]);
    const [filteredClasses, setFilteredClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentClass, setCurrentClass] = useState({
        id: '',
        name: '',
        grade: '',
        section: '',
        teacher: '',
        subject: '',
        schedule: '',
        room: '',
        capacity: '',
        enrolled: '',
        startDate: '',
        endDate: '',
    });

    // Mock data for demonstration
    useEffect(() => {
        const mockClasses = [
            {
                id: '1',
                name: 'Advanced Mathematics',
                grade: '11',
                section: 'A',
                teacher: 'Sarah Johnson',
                subject: 'Mathematics',
                schedule: 'Monday, Wednesday, Friday 09:00-10:30',
                room: 'S-101',
                capacity: '30',
                enrolled: '28',
                startDate: '2025-01-15',
                endDate: '2025-05-30',
            },
            {
                id: '2',
                name: 'English Literature',
                grade: '10',
                section: 'B',
                teacher: 'Michael Brown',
                subject: 'English',
                schedule: 'Tuesday, Thursday 11:00-12:30',
                room: 'H-203',
                capacity: '25',
                enrolled: '22',
                startDate: '2025-01-15',
                endDate: '2025-05-30',
            },
            {
                id: '3',
                name: 'Physics Fundamentals',
                grade: '12',
                section: 'A',
                teacher: 'David Wilson',
                subject: 'Physics',
                schedule: 'Monday, Wednesday, Friday 13:00-14:30',
                room: 'S-105',
                capacity: '28',
                enrolled: '26',
                startDate: '2025-01-15',
                endDate: '2025-05-30',
            },
            {
                id: '4',
                name: 'World History',
                grade: '9',
                section: 'C',
                teacher: 'Jennifer Lee',
                subject: 'History',
                schedule: 'Tuesday, Thursday 09:00-10:30',
                room: 'H-105',
                capacity: '32',
                enrolled: '30',
                startDate: '2025-01-15',
                endDate: '2025-05-30',
            },
            {
                id: '5',
                name: 'Computer Programming',
                grade: '11',
                section: 'B',
                teacher: 'Robert Chen',
                subject: 'Computer Science',
                schedule: 'Monday, Wednesday 14:00-15:30',
                room: 'T-302',
                capacity: '24',
                enrolled: '20',
                startDate: '2025-01-15',
                endDate: '2025-05-30',
            },
        ];
        setClasses(mockClasses);
        setFilteredClasses(mockClasses);
    }, []);

    // Search functionality
    useEffect(() => {
        const results = classes.filter(classItem =>
            classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
            classItem.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredClasses(results);
    }, [searchTerm, classes]);

    // Handle input changes for add/edit forms
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentClass({ ...currentClass, [name]: value });
    };

    // Add new class
    const handleAddClass = () => {
        const newClass = {
            ...currentClass,
            id: Date.now().toString()
        };
        setClasses([...classes, newClass]);
        setIsAddModalOpen(false);
        setCurrentClass({
            id: '',
            name: '',
            grade: '',
            section: '',
            teacher: '',
            subject: '',
            schedule: '',
            room: '',
            capacity: '',
            enrolled: '',
            startDate: '',
            endDate: '',
        });
    };

    // Edit class
    const handleEditClass = () => {
        const updatedClasses = classes.map(classItem =>
            classItem.id === currentClass.id ? currentClass : classItem
        );
        setClasses(updatedClasses);
        setIsEditModalOpen(false);
    };

    // Delete class
    const handleDeleteClass = () => {
        const filteredClasses = classes.filter(classItem => classItem.id !== currentClass.id);
        setClasses(filteredClasses);
        setIsDeleteModalOpen(false);
    };

    // Open edit modal and set current class
    const openEditModal = (classItem) => {
        setCurrentClass(classItem);
        setIsEditModalOpen(true);
    };

    // Open delete modal and set current class
    const openDeleteModal = (classItem) => {
        setCurrentClass(classItem);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6 text-gray-600">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-6">Class Management</h1>

                    {/* Search and Action Buttons */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search classes by name, teacher or subject..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setCurrentClass({
                                        id: '',
                                        name: '',
                                        grade: '',
                                        section: '',
                                        teacher: '',
                                        subject: '',
                                        schedule: '',
                                        room: '',
                                        capacity: '',
                                        enrolled: '',
                                        startDate: '',
                                        endDate: '',
                                    });
                                    setIsAddModalOpen(true);
                                }}
                                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Class</span>
                            </button>
                        </div>
                    </div>

                    {/* Class Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 table-fixed">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Class Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Grade & Section</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Teacher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredClasses.length > 0 ? (
                                    filteredClasses.map((classItem) => (
                                        <tr key={classItem.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{classItem.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">Grade {classItem.grade} - {classItem.section}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{classItem.teacher}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{classItem.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(classItem)}
                                                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(classItem)}
                                                        className="text-red-600 hover:text-red-900 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                            No classes found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Class Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Class</h2>
                            <button onClick={() => setIsAddModalOpen(false)}>
                                <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={currentClass.name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={currentClass.subject}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                                <input
                                    type="text"
                                    name="grade"
                                    value={currentClass.grade}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <input
                                    type="text"
                                    name="section"
                                    value={currentClass.section}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                <input
                                    type="text"
                                    name="teacher"
                                    value={currentClass.teacher}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                                <input
                                    type="text"
                                    name="room"
                                    value={currentClass.room}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                <input
                                    type="text"
                                    name="capacity"
                                    value={currentClass.capacity}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enrolled Students</label>
                                <input
                                    type="text"
                                    name="enrolled"
                                    value={currentClass.enrolled}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={currentClass.startDate}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={currentClass.endDate}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                                <textarea
                                    name="schedule"
                                    value={currentClass.schedule}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Monday, Wednesday, Friday 09:00-10:30"
                                ></textarea>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddClass}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                            >
                                Add Class
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Class Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Edit Class</h2>
                            <button onClick={() => setIsEditModalOpen(false)}>
                                <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={currentClass.name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={currentClass.subject}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                                <input
                                    type="text"
                                    name="grade"
                                    value={currentClass.grade}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <input
                                    type="text"
                                    name="section"
                                    value={currentClass.section}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                                <input
                                    type="text"
                                    name="teacher"
                                    value={currentClass.teacher}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                                <input
                                    type="text"
                                    name="room"
                                    value={currentClass.room}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                                <input
                                    type="text"
                                    name="capacity"
                                    value={currentClass.capacity}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enrolled Students</label>
                                <input
                                    type="text"
                                    name="enrolled"
                                    value={currentClass.enrolled}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={currentClass.startDate}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={currentClass.endDate}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                                <textarea
                                    name="schedule"
                                    value={currentClass.schedule}
                                    onChange={handleInputChange}
                                    rows="2"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Monday, Wednesday, Friday 09:00-10:30"
                                ></textarea>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditClass}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Update Class
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Confirm Delete</h2>
                            <button onClick={() => setIsDeleteModalOpen(false)}>
                                <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>
                        <p className="mb-6">
                            Are you sure you want to delete the class <span className="font-semibold">{currentClass.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteClass}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}