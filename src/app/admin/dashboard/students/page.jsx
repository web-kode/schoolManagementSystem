"use client"
import { useState, useEffect } from 'react';
import { Search, Plus, Upload, Edit, Trash2, X, Check, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({
    id: '',
    name: '',
    email: '',
    grade: '',
    section: '',
    rollNo: '',
    parentName: '',
    contactNumber: '',
    address: '',
    dateOfBirth: '',
  });
  const [bulkUploadPreview, setBulkUploadPreview] = useState([]);
  const [bulkUploadFile, setBulkUploadFile] = useState(null);

  // Mock data for demonstration
  useEffect(() => {
    const mockStudents = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        grade: '10',
        section: 'A',
        rollNo: '101',
        parentName: 'Michael Doe',
        contactNumber: '555-123-4567',
        address: '123 Main St, Anytown',
        dateOfBirth: '2008-05-15',
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        grade: '9',
        section: 'B',
        rollNo: '202',
        parentName: 'Sarah Smith',
        contactNumber: '555-987-6543',
        address: '456 Elm St, Othertown',
        dateOfBirth: '2009-02-20',
      },
      {
        id: '3',
        name: 'Alex Johnson',
        email: 'alex.j@example.com',
        grade: '11',
        section: 'C',
        rollNo: '303',
        parentName: 'Robert Johnson',
        contactNumber: '555-456-7890',
        address: '789 Oak Ave, Somewhere',
        dateOfBirth: '2007-11-10',
      },
      {
        id: '4',
        name: 'Emily Wilson',
        email: 'emily.w@example.com',
        grade: '10',
        section: 'A',
        rollNo: '104',
        parentName: 'Jessica Wilson',
        contactNumber: '555-234-5678',
        address: '321 Pine Rd, Elsewhere',
        dateOfBirth: '2008-09-25',
      },
      {
        id: '5',
        name: 'Michael Brown',
        email: 'michael.b@example.com',
        grade: '12',
        section: 'D',
        rollNo: '405',
        parentName: 'David Brown',
        contactNumber: '555-876-5432',
        address: '654 Maple Dr, Nowhere',
        dateOfBirth: '2006-07-30',
      },
    ];
    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
  }, []);

  // Search functionality
  useEffect(() => {
    const results = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(results);
  }, [searchTerm, students]);

  // Handle input changes for add/edit forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentStudent({ ...currentStudent, [name]: value });
  };

  // Add new student
  const handleAddStudent = () => {
    const newStudent = {
      ...currentStudent,
      id: Date.now().toString()
    };
    setStudents([...students, newStudent]);
    setIsAddModalOpen(false);
    setCurrentStudent({
      id: '',
      name: '',
      email: '',
      grade: '',
      section: '',
      rollNo: '',
      parentName: '',
      contactNumber: '',
      address: '',
      dateOfBirth: '',
    });
  };

  // Edit student
  const handleEditStudent = () => {
    const updatedStudents = students.map(student => 
      student.id === currentStudent.id ? currentStudent : student
    );
    setStudents(updatedStudents);
    setIsEditModalOpen(false);
  };

  // Delete student
  const handleDeleteStudent = () => {
    const filteredStudents = students.filter(student => student.id !== currentStudent.id);
    setStudents(filteredStudents);
    setIsDeleteModalOpen(false);
  };

  // Open edit modal and set current student
  const openEditModal = (student) => {
    setCurrentStudent(student);
    setIsEditModalOpen(true);
  };

  // Open delete modal and set current student
  const openDeleteModal = (student) => {
    setCurrentStudent(student);
    setIsDeleteModalOpen(true);
  };

  // Handle bulk upload file selection
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBulkUploadFile(file);
      // We don't need to parse the file on frontend anymore
      // Just set it for reference and display the file name
      setBulkUploadPreview([{ name: file.name, size: `${(file.size / 1024).toFixed(2)} KB` }]);
    }
  };

  // Process bulk upload - send file to backend
  const processBulkUpload = () => {
    if (bulkUploadFile) {
      // In a real implementation, you would:
      // 1. Create a FormData object
      // 2. Append the file to it
      // 3. Send it to your backend API
      
      // Example:
      // const formData = new FormData();
      // formData.append('file', bulkUploadFile);
      // fetch('/api/students/bulk-upload', {
      //   method: 'POST',
      //   body: formData
      // }).then(response => {
      //   if (response.ok) {
      //     // Handle success, maybe refresh the student list
      //     // fetchStudents();
      //   }
      // });
      
      // For demo purposes, just close the modal
      alert('File would be sent to backend: ' + bulkUploadFile.name);
      setIsBulkUploadModalOpen(false);
      setBulkUploadPreview([]);
      setBulkUploadFile(null);
    }
  };

  // Download sample Excel template
  const downloadSampleTemplate = () => {
    const template = [
      {
        name: 'Sample Name',
        email: 'sample@example.com',
        grade: '10',
        section: 'A',
        rollNo: '101',
        parentName: 'Parent Name',
        contactNumber: '555-123-4567',
        address: '123 Main St',
        dateOfBirth: '2008-01-01',
      }
    ];
    
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, 'student_template.xlsx');
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6 text-gray-600">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Student Management</h1>
          
          {/* Search and Action Buttons */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search students by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentStudent({
                    id: '',
                    name: '',
                    email: '',
                    grade: '',
                    section: '',
                    rollNo: '',
                    parentName: '',
                    contactNumber: '',
                    address: '',
                    dateOfBirth: '',
                  });
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Student</span>
              </button>
              <button 
                onClick={() => setIsBulkUploadModalOpen(true)}
                className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Bulk Upload</span>
              </button>
            </div>
          </div>
          
          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 table-fixed">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Grade/Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{student.grade} - {student.section}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{student.rollNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => openEditModal(student)}
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(student)}
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
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Student</h2>
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
                  value={currentStudent.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={currentStudent.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={currentStudent.grade}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input
                  type="text"
                  name="section"
                  value={currentStudent.section}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll No</label>
                <input
                  type="text"
                  name="rollNo"
                  value={currentStudent.rollNo}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                <input
                  type="text"
                  name="parentName"
                  value={currentStudent.parentName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={currentStudent.contactNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={currentStudent.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={currentStudent.address}
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
                onClick={handleAddStudent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Student</h2>
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
                  value={currentStudent.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={currentStudent.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={currentStudent.grade}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <input
                  type="text"
                  name="section"
                  value={currentStudent.section}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll No</label>
                <input
                  type="text"
                  name="rollNo"
                  value={currentStudent.rollNo}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                <input
                  type="text"
                  name="parentName"
                  value={currentStudent.parentName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={currentStudent.contactNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={currentStudent.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  value={currentStudent.address}
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
                onClick={handleEditStudent}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Student
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
              Are you sure you want to delete the student <span className="font-semibold">{currentStudent.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Bulk Upload Students</h2>
              <button onClick={() => setIsBulkUploadModalOpen(false)}>
                <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-2">
                Upload an Excel file with student data. The file should contain columns for name, email, grade, section, rollNo, parentName, contactNumber, address, and dateOfBirth.
              </p>
              
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={downloadSampleTemplate}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Sample Template</span>
                </button>
              </div>
              
              <label className="block p-4 border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer hover:bg-gray-50">
                <input
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                />
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">Excel or CSV files only</p>
              </label>
              
              {bulkUploadFile && (
                <div className="mt-2 text-sm text-gray-600">
                  File selected: {bulkUploadFile.name}
                </div>
              )}
            </div>
            
            {bulkUploadFile && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Selected File</h3>
                <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">File name:</span> 
                    <span>{bulkUploadFile.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-medium">Size:</span> 
                    <span>{(bulkUploadFile.size / 1024).toFixed(2)} KB</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-medium">Type:</span> 
                    <span>{bulkUploadFile.type}</span>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    File will be sent to the backend for processing.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsBulkUploadModalOpen(false);
                  setBulkUploadPreview([]);
                  setBulkUploadFile(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={processBulkUpload}
                disabled={!bulkUploadFile}
                className={`px-4 py-2 rounded-md ${
                  bulkUploadFile
                    ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                    : 'bg-blue-300 text-white cursor-not-allowed'
                }`}
              >
                Import Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}