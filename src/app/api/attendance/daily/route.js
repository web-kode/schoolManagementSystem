import { NextResponse } from "next/server";
import { dbConnect, verifyToken, ApiError } from "@/app/utils";
import Attendance from "@/app/models/Attendance.js";
import Class from "@/app/models/Class";
import User from "@/app/models/User";

/**
 * GET handler for retrieving daily attendance summary
 * Can be used for dashboard displays and overview reports
 */
export async function GET(req) {
    try {
        await verifyToken(req);
        await dbConnect();
        
        // Parse query parameters
        const url = new URL(req.url);
        const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0]; // Default to today
        const type = url.searchParams.get('type') || 'daily'; // Default to daily attendance
        
        // Get all active classes
        const classes = await Class.find().lean();
        
        // Initialize result object
        const result = {
            date,
            type,
            schoolSummary: {
                totalStudents: 0,
                present: 0,
                absent: 0,
                leave: 0,
                notMarked: 0,
                attendancePercentage: 0
            },
            classSummaries: []
        };
        
        // Get the total number of students in the school
        const totalStudentsCount = await User.countDocuments({ role: 'student', isActive: true });
        result.schoolSummary.totalStudents = totalStudentsCount;
        
        // For each class, get attendance summary
        for (const classData of classes) {
            // Get the number of students in this class
            const classStudentCount = await User.countDocuments({
                class: classData.class,
                section: classData.section,
                role: 'student',
                isActive: true
            });
            
            // Get attendance for this class on this date
            const attendanceRecords = await Attendance.find({
                classId: classData._id,
                date,
                type
            }).lean();
            
            // Initialize class summary
            const classSummary = {
                _id: classData._id,
                name: classData.name,
                class: classData.class,
                section: classData.section,
                totalStudents: classStudentCount,
                present: 0,
                absent: 0,
                leave: 0,
                notMarked: classStudentCount, // Initially all students are not marked
                attendancePercentage: 0,
                attendanceRecords: attendanceRecords.length
            };
            
            // If attendance is marked for this class, update the summary
            if (attendanceRecords.length > 0) {
                // Get unique student IDs with attendance marked
                const markedStudentIds = new Set();
                let presentCount = 0;
                let absentCount = 0;
                let leaveCount = 0;
                
                // Aggregate attendance status across all records for this class
                attendanceRecords.forEach(record => {
                    record.students.forEach(student => {
                        const studentId = String(student.student);
                        markedStudentIds.add(studentId);
                        
                        if (student.status === 'Present') presentCount++;
                        else if (student.status === 'Absent') absentCount++;
                        else if (student.status === 'Leave') leaveCount++;
                    });
                });
                
                // For period-wise attendance, we may have multiple records for the same student
                // We need to normalize the counts if we're handling period attendance
                if (type === 'period' && attendanceRecords.length > 0) {
                    const periodCount = attendanceRecords.length;
                    presentCount = Math.round(presentCount / periodCount);
                    absentCount = Math.round(absentCount / periodCount);
                    leaveCount = Math.round(leaveCount / periodCount);
                }
                
                // Update class summary
                classSummary.present = presentCount;
                classSummary.absent = absentCount;
                classSummary.leave = leaveCount;
                classSummary.notMarked = classSummary.totalStudents - markedStudentIds.size;
                
                if (classSummary.totalStudents > 0) {
                    classSummary.attendancePercentage = Math.round(
                        (presentCount / classSummary.totalStudents) * 100
                    );
                }
            }
            
            // Add class summary to result
            result.classSummaries.push(classSummary);
            
            // Update school summary
            result.schoolSummary.present += classSummary.present;
            result.schoolSummary.absent += classSummary.absent;
            result.schoolSummary.leave += classSummary.leave;
            result.schoolSummary.notMarked += classSummary.notMarked;
        }
        
        // Calculate school attendance percentage
        if (result.schoolSummary.totalStudents > 0) {
            result.schoolSummary.attendancePercentage = Math.round(
                (result.schoolSummary.present / result.schoolSummary.totalStudents) * 100
            );
        }
        
        // Sort class summaries by name
        result.classSummaries.sort((a, b) => {
            if (a.class !== b.class) {
                return a.class - b.class;
            }
            return a.section.localeCompare(b.section);
        });
        
        return NextResponse.json({
            status: "success",
            data: result
        }, { status: 200 });
        
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to fetch daily attendance summary", error, 500);
    }
}