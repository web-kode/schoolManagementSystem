"use client";

import { useState, useEffect, useRef } from 'react';
import { Menu, User, Users, BookOpen, Calendar, CheckSquare, Bell, Ticket, FileText, ChevronDown, Search, LogOut, Settings } from 'lucide-react';
import axios from 'axios';
import {toast} from "react-toastify"
import { useRouter } from "next/navigation"

export default function AdminDashboardLayout({ children }) {
    const [greeting, setGreeting] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);
    const user = JSON.parse(localStorage.getItem("user"))
    const username = user?.name;
    const router = useRouter()
    const [islogoutLoading, setIsLogoutLoading] = useState(false)

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                setGreeting('Good Morning');
            } else if (hour >= 12 && hour < 18) {
                setGreeting('Good Afternoon');
            } else {
                setGreeting('Good Evening');
            }
        };

        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        };

        updateGreeting();
        updateTime();

        const interval = setInterval(() => {
            updateGreeting();
            updateTime();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Handle click outside to close profile menu
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileMenuRef]);

    // Get first letter of username for avatar
    const firstLetter = username?.charAt(0) || 'A';

    // Navigation items
    const navItems = [
        { name: 'Profile', icon: User, to: '' },
        { name: 'Students', icon: Users, to: 'students' },
        { name: 'Teachers', icon: Users, to: 'teachers' },
        { name: 'Classes', icon: BookOpen, to: 'classes' },
        { name: 'Timetables', icon: Calendar, to: 'timetables' },
        { name: 'Attendance', icon: CheckSquare, to: 'attendance' },
        { name: 'Announcements', icon: Bell, to: 'announcements' },
        { name: 'Tickets', icon: Ticket, to: 'tickets' },
        { name: 'Leave Requests', icon: FileText, to: 'leave-requests' }
    ];

    const [activeNav, setActiveNav] = useState('Dashboard');

    const handleLogout = async() => {

        try {
            const url = `/api/admin/logout`
            await axios.post(url)
            localStorage.removeItem('user')
            toast.success("Admin logged out!");
            router.push("/admin/login")
        } catch (error) {
            console.log("Error while logging out : ", error)
            toast.error("Error in logging out admin!");
        }
    };

    const handleEditProfile = () => {
        // Navigate to profile edit page
        console.log("Edit profile...");
        // router.push("/admin/dashboard/profile/edit");
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="flex flex-col w-64 bg-white shadow-lg">
                <div className="h-16 p-4 border-b flex items-center space-x-2">
                    <div className="p-2 bg-blue-600 rounded text-white">
                        <Menu size={20} />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.name}>
                                <button
                                    className={`flex items-center w-full px-6 py-3 text-left ${activeNav === item.name
                                        ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    onClick={() => {
                                        setActiveNav(item.name);
                                        router.push(`/admin/dashboard/${item.to}`)
                                    }}
                                >
                                    <item.icon className="mr-3" size={18} />
                                    <span>{item.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center space-x-3">
                        <div
                            className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium cursor-pointer"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        >
                            {firstLetter}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium">{username}</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                        <ChevronDown
                            size={16}
                            className="text-gray-400 cursor-pointer"
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                        />
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="flex items-center justify-between h-16 px-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">{greeting}, {username}</h2>
                            <p className="text-sm text-gray-500">{currentTime} | {new Date().toLocaleDateString()}</p>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            </div>

                            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                    3
                                </span>
                            </button>

                            <div className="relative" ref={profileMenuRef}>
                                <div
                                    className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium cursor-pointer"
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                >
                                    {firstLetter}
                                </div>

                                {/* Profile dropdown menu */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        <button
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                            onClick={handleEditProfile}
                                        >
                                            <Settings size={16} className="mr-2" />
                                            Edit Profile
                                        </button>
                                        <button
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={16} className="mr-2" />
                                            {islogoutLoading ? "Logging out..." : "Logout" }
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}