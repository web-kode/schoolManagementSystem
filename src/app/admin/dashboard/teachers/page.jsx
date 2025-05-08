"use client"
import { useState, useEffect } from 'react';
import { Search, Plus, Upload, Edit, Trash2, X } from 'lucide-react';

export default function TeacherManagement() {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentTeacher, setCurrentTeacher] = useState({
        id: '',
        name: '',
        email: '',
        subject: '',
        department: '',
        qualification: '',
        employeeId: '',
        contactNumber: '',
        address: '',
        joinDate: '',
        experience: '',
    });

    // Mock data for demonstration
    useEffect(() => {
        const mockTeachers = [
            {
                id: '1',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@example.com',
                subject: 'Mathematics',
                department: 'Science',
                qualification: 'Ph.D. in Mathematics',
                employeeId: 'T-001',
                contactNumber: '555-123-4567',
                address: '123 Faculty Ave, Anytown',
                joinDate: '2018-07-15',
                experience: '8 years',
            },
            {
                id: '2',
                name: 'Michael Brown',
                email: 'michael.brown@example.com',
                subject: 'English Literature',
                department: 'Humanities',
                qualification: 'M.A. in English',
                employeeId: 'T-002',
                contactNumber: '555-987-6543',
                address: '456 Teacher St, Othertown',
                joinDate: '2016-08-22',
                experience: '10 years',
            },
            {
                id: '3',
                name: 'David Wilson',
                email: 'david.wilson@example.com',
                subject: 'Physics',
                department: 'Science',
                qualification: 'Ph.D. in Physics',
                employeeId: 'T-003',
                contactNumber: '555-456-7890',
                address: '789 Science Blvd, Somewhere',
                joinDate: '2019-01-10',
                experience: '6 years',
            },
            {
                id: '4',
                name: 'Jennifer Lee',
                email: 'jennifer.lee@example.com',
                subject: 'History',
                department: 'Humanities',
                qualification: 'M.A. in History',
                employeeId: 'T-004',
                contactNumber: '555-234-5678',
                address: '321 History Lane, Elsewhere',
                joinDate: '2020-09-01',
                experience: '5 years',
            },
            {
                id: '5',
                name: 'Robert Chen',
                email: 'robert.chen@example.com',
                subject: 'Computer Science',
                department: 'Technology',
                qualification: 'M.S. in Computer Science',
                employeeId: 'T-005',
                contactNumber: '555-876-5432',
                address: '654 Tech Drive, Nowhere',
                joinDate: '2017-11-15',
                experience: '9 years',
            },
        ];
        setTeachers(mockTeachers);
        setFilteredTeachers(mockTeachers);
    }, []);

    // Search functionality
    useEffect(() => {
        const results = teachers.filter(teacher =>
            teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTeachers(results);
    }, [searchTerm, teachers]);

    // Handle input changes for add/edit forms
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentTeacher({ ...currentTeacher, [name]: value });
    };

    // Add new teacher
    const handleAddTeacher = () => {
        const newTeacher = {
            ...currentTeacher,
            id: Date.now().toString()
        };
        setTeachers([...teachers, newTeacher]);
        setIsAddModalOpen(false);
        setCurrentTeacher({
            id: '',
            name: '',
            email: '',
            subject: '',
            department: '',
            qualification: '',
            employeeId: '',
            contactNumber: '',
            address: '',
            joinDate: '',
            experience: '',
        });
    };

    // Edit teacher
    const handleEditTeacher = () => {
        const updatedTeachers = teachers.map(teacher =>
            teacher.id === currentTeacher.id ? currentTeacher : teacher
        );
        setTeachers(updatedTeachers);
        setIsEditModalOpen(false);
    };

    // Delete teacher
    const handleDeleteTeacher = () => {
        const filteredTeachers = teachers.filter(teacher => teacher.id !== currentTeacher.id);
        setTeachers(filteredTeachers);
        setIsDeleteModalOpen(false);
    };

    // Open edit modal and set current teacher
    const openEditModal = (teacher) => {
        setCurrentTeacher(teacher);
        setIsEditModalOpen(true);
    };

    // Open delete modal and set current teacher
    const openDeleteModal = (teacher) => {
        setCurrentTeacher(teacher);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen p-6 text-gray-600">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-2xl font-bold mb-6">Teacher Management</h1>

                    {/* Search and Action Buttons */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search teachers by name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setCurrentTeacher({
                                        id: '',
                                        name: '',
                                        email: '',
                                        subject: '',
                                        department: '',
                                        qualification: '',
                                        employeeId: '',
                                        contactNumber: '',
                                        address: '',
                                        joinDate: '',
                                        experience: '',
                                    });
                                    setIsAddModalOpen(true);
                                }}
                                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Teacher</span>
                            </button>
                        </div>
                    </div>

                    {/* Teacher Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 table-fixed">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredTeachers.length > 0 ? (
                                    filteredTeachers.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{teacher.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{teacher.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{teacher.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">{teacher.department}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(teacher)}
                                                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(teacher)}
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
                                            No teachers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Teacher Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Teacher</h2>
                            <button onClick={() => setIsAddModalOpen(false)}>
                                <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={currentTeacher.name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={currentTeacher.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={currentTeacher.subject}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={currentTeacher.department}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={currentTeacher.qualification}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                                <input
                                    type="text"
                                    name="employeeId"
                                    value={currentTeacher.employeeId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                <input
                                    type="text"
                                    name="contactNumber"
                                    value={currentTeacher.contactNumber}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                                <input
                                    type="date"
                                    name="joinDate"
                                    value={currentTeacher.joinDate}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={currentTeacher.experience}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. 5 years"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={currentTeacher.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                onClick={handleAddTeacher}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                            >
                                Add Teacher
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Teacher Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Edit Teacher</h2>
                            <button onClick={() => setIsEditModalOpen(false)}>
                                <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={currentTeacher.name}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={currentTeacher.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={currentTeacher.subject}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={currentTeacher.department}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                <input
                                    type="text"
                                    name="qualification"
                                    value={currentTeacher.qualification}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                                <input
                                    type="text"
                                    name="employeeId"
                                    value={currentTeacher.employeeId}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                <input
                                    type="text"
                                    name="contactNumber"
                                    value={currentTeacher.contactNumber}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                                <input
                                    type="date"
                                    name="joinDate"
                                    value={currentTeacher.joinDate}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={currentTeacher.experience}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. 5 years"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    name="address"
                                    value={currentTeacher.address}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                onClick={handleEditTeacher}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Update Teacher
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
                            Are you sure you want to delete the teacher <span className="font-semibold">{currentTeacher.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteTeacher}
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