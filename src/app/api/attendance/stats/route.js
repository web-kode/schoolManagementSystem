import { NextResponse } from "next/server";
import { dbConnect, verifyToken, verifyAdminOrTeacher, ApiError } from "@/app/utils";
import Attendance from "@/app/models/Attendance.js";
import User from "@/app/models/User";
import Class from "@/app/models/Class";

/**
 * GET handler for retrieving attendance statistics
 * Can be used to get attendance reports for classes or specific students
 */
export async function GET(req) {
    try {
        await verifyToken(req);
        await dbConnect();

        // Parse query parameters
        const url = new URL(req.url);
        const classId = url.searchParams.get('classId');
        const studentId = url.searchParams.get('studentId');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        const type = url.searchParams.get('type') || 'daily'; // Default to daily

        // Validate required parameters
        if (!startDate || !endDate) {
            throw new ApiError("Start date and end date are required for stats", 400);
        }

        // Different stats logic based on whether we're looking at class stats or individual student stats
        if (classId) {
            // Verify the class exists
            const classExists = await Class.findById(classId);
            if (!classExists) throw new ApiError("Class not found", 404);

            // Get attendance records for this class in the date range
            const attendanceRecords = await Attendance.find({
                classId,
                date: { $gte: startDate, $lte: endDate },
                type
            }).populate('students.student', 'name rollNumber');

            if (attendanceRecords.length === 0) {
                return NextResponse.json({
                    status: "success",
                    message: "No attendance records found for this date range",
                    data: {
                        totalDays: 0,
                        stats: []
                    }
                }, { status: 200 });
            }

            // Get all students in this class
            const students = await User.find({
                class: classExists.class,
                section: classExists.section,
                role: "student"
            }).select('_id name rollNumber');

            // Calculate attendance stats for each student
            const studentStats = students.map(student => {
                const studentId = String(student._id);
                let presentCount = 0;
                let absentCount = 0;
                let leaveCount = 0;

                attendanceRecords.forEach(record => {
                    // console.log("Record : : ", record.students)
                    // console.log("Student id : : ", studentId);
                    // console.log("Student id 2 : : ", record.students.student?._id);
                    // console.log("Student id 3 : : ", record.students.student);

                    const studentEntry = record.students.find(
                        s => String(s.student?._id || s.student) == studentId
                    );

                    if (studentEntry) {
                        if (studentEntry.status === 'Present') presentCount++;
                        else if (studentEntry.status === 'Absent') absentCount++;
                        else if (studentEntry.status === 'Leave') leaveCount++;
                    }
                });

                const totalDays = attendanceRecords.length;
                const attendancePercentage = totalDays > 0
                    ? ((presentCount / totalDays) * 100).toFixed(2)
                    : "0.00";

                return {
                    student: {
                        _id: student._id,
                        name: student.name,
                        rollNumber: student.rollNumber
                    },
                    present: presentCount,
                    absent: absentCount,
                    leave: leaveCount,
                    totalDays,
                    attendancePercentage
                };
            });

            return NextResponse.json({
                status: "success",
                data: {
                    class: {
                        _id: classExists._id,
                        name: classExists.name
                    },
                    dateRange: {
                        start: startDate,
                        end: endDate
                    },
                    totalDays: attendanceRecords.length,
                    students: studentStats
                }
            }, { status: 200 });
        }
        else if (studentId) {
            // Verify the student exists
            const student = await User.findOne({ _id: studentId, role: "student" });
            if (!student) throw new ApiError("Student not found", 404);

            // Get all attendance records for this student in the date range
            const attendanceRecords = await Attendance.find({
                date: { $gte: startDate, $lte: endDate },
                type,
                'students.student': studentId
            }).populate('classId', 'name class section');

            // Organize by class
            const classwiseAttendance = {};

            attendanceRecords.forEach(record => {
                const classId = String(record.classId._id);
                const className = record.classId.name;

                if (!classwiseAttendance[classId]) {
                    classwiseAttendance[classId] = {
                        classId,
                        className,
                        present: 0,
                        absent: 0,
                        leave: 0,
                        totalDays: 0
                    };
                }

                const studentEntry = record.students.find(
                    s => String(s.student?._id || s.student) === studentId
                );

                if (studentEntry) {
                    classwiseAttendance[classId].totalDays++;

                    if (studentEntry.status === 'Present') classwiseAttendance[classId].present++;
                    else if (studentEntry.status === 'Absent') classwiseAttendance[classId].absent++;
                    else if (studentEntry.status === 'Leave') classwiseAttendance[classId].leave++;
                }
            });

            // Calculate percentages
            Object.values(classwiseAttendance).forEach(classData => {
                classData.attendancePercentage = classData.totalDays > 0
                    ? ((classData.present / classData.totalDays) * 100).toFixed(2)
                    : 0;
            });

            // Calculate overall stats
            const overallStats = {
                present: 0,
                absent: 0,
                leave: 0,
                totalDays: 0
            };

            Object.values(classwiseAttendance).forEach(classData => {
                overallStats.present += classData.present;
                overallStats.absent += classData.absent;
                overallStats.leave += classData.leave;
                overallStats.totalDays += classData.totalDays;
            });

            overallStats.attendancePercentage = overallStats.totalDays > 0
                ? Math.round((overallStats.present / overallStats.totalDays) * 100)
                : 0;

            return NextResponse.json({
                status: "success",
                data: {
                    student: {
                        _id: student._id,
                        name: student.name,
                        rollNumber: student.rollNumber,
                        class: student.class,
                        section: student.section
                    },
                    dateRange: {
                        start: startDate,
                        end: endDate
                    },
                    overall: overallStats,
                    classwiseAttendance: Object.values(classwiseAttendance)
                }
            }, { status: 200 });
        }
        else {
            throw new ApiError("Either classId or studentId is required", 400);
        }
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to fetch attendance statistics", error, 500);
    }
}