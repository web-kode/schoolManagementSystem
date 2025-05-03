import { NextResponse } from "next/server";
import { dbConnect, verifyToken, ApiError } from "@/app/utils";
import Attendance from "@/app/models/Attendance.js";
import User from "@/app/models/User";

/**
 * GET handler for retrieving attendance for a specific student
 * Can be accessed by admins, teachers, or the student themselves
 */
export async function GET(req, { params }) {
    try {
        const { user } = await verifyToken(req);
        await dbConnect();
        
        const studentId = params.id;
        
        // Check if user has permission to view this student's attendance
        // Only allow if user is an admin, a teacher, or the student themselves
        if (user.role === 'student' && user._id !== studentId) {
            throw new ApiError("Unauthorized to view another student's attendance", 403);
        }
        
        // Parse query parameters
        const url = new URL(req.url);
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        const type = url.searchParams.get('type');
        const classId = url.searchParams.get('classId');
        
        // Build query
        const query = {
            'students.student': studentId
        };
        
        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }
        
        if (type) query.type = type;
        if (classId) query.classId = classId;
        
        // Verify student exists
        const student = await User.findById(studentId);
        if (!student || student.role !== 'student') {
            throw new ApiError("Student not found", 404);
        }
        
        // Fetch attendance records
        const attendanceRecords = await Attendance.find(query)
            .populate('classId', 'name class section')
            .populate('takenBy', 'name')
            .sort({ date: -1 }); // Most recent first
        
        // Process attendance data for the specific student
        const processedRecords = attendanceRecords.map(record => {
            const studentEntry = record.students.find(
                s => String(s.student?._id || s.student) === studentId
            );
            
            return {
                _id: record._id,
                date: record.date,
                type: record.type,
                period: record.period,
                class: record.classId ? {
                    _id: record.classId._id,
                    name: record.classId.name
                } : null,
                status: studentEntry ? studentEntry.status : null,
                takenBy: record.takenBy ? record.takenBy.name : null,
                createdAt: record.createdAt
            };
        });
        
        // Calculate attendance statistics
        const stats = {
            total: processedRecords.length,
            present: processedRecords.filter(r => r.status === 'Present').length,
            absent: processedRecords.filter(r => r.status === 'Absent').length,
            leave: processedRecords.filter(r => r.status === 'Leave').length
        };
        
        stats.attendancePercentage = stats.total > 0 
            ? ((stats.present / stats.total) * 100).toFixed(2)
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
                stats,
                records: processedRecords
            }
        }, { status: 200 });
        
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to fetch student attendance", error, 500);
    }
}