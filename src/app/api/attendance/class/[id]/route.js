import { NextResponse } from "next/server";
import { dbConnect, verifyToken, verifyAdminOrTeacher, ApiError } from "@/app/utils";
import Attendance from "@/app/models/Attendance.js";
import Class from "@/app/models/Class";
import User from "@/app/models/User";

/**
 * GET handler for retrieving attendance for a specific class
 * Can be accessed by admins and teachers only
 */
export async function GET(req, { params }) {
    try {
        await verifyToken(req);
        await verifyAdminOrTeacher(req);
        await dbConnect();
        
        const classId = params.id;
        
        // Verify class exists
        const classData = await Class.findById(classId);
        if (!classData) {
            throw new ApiError("Class not found", 404);
        }
        
        // Parse query parameters
        const url = new URL(req.url);
        const date = url.searchParams.get('date'); // Single date
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');
        const type = url.searchParams.get('type');
        const period = url.searchParams.get('period');
        
        // Build query
        const query = { classId };
        
        if (date) {
            query.date = date;
        } else if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }
        
        if (type) query.type = type;
        if (period) query.period = period;
        
        // Fetch attendance records
        const attendanceRecords = await Attendance.find(query)
            .populate('takenBy', 'name')
            .populate('students.student', 'name rollNumber')
            .sort({ date: -1, period: 1 }); // Sort by date desc, period asc
        
        // If looking for a specific date's attendance
        if (date && attendanceRecords.length > 0) {
            // Get all students in this class
            const students = await User.find({
                class: classData.class,
                section: classData.section,
                role: "student"
            }).select('_id name rollNumber');
            
            // For each attendance record, add missing students with status "Not Marked"
            const completeRecords = attendanceRecords.map(record => {
                const recordObj = record.toObject();
                const presentStudentIds = new Set(recordObj.students.map(s => 
                    String(s.student?._id || s.student)
                ));
                
                // Add missing students
                students.forEach(student => {
                    const studentId = String(student._id);
                    if (!presentStudentIds.has(studentId)) {
                        recordObj.students.push({
                            student: {
                                _id: student._id,
                                name: student.name,
                                rollNumber: student.rollNumber
                            },
                            status: "Not Marked"
                        });
                    }
                });
                
                // Sort students by roll number
                recordObj.students.sort((a, b) => {
                    const rollA = a.student?.rollNumber || "";
                    const rollB = b.student?.rollNumber || "";
                    return rollA.localeCompare(rollB, undefined, { numeric: true });
                });
                
                return recordObj;
            });
            
            return NextResponse.json({
                status: "success",
                data: {
                    class: {
                        _id: classData._id,
                        name: classData.name,
                        class: classData.class,
                        section: classData.section
                    },
                    records: completeRecords
                }
            }, { status: 200 });
        }
        
        // For date range or all attendance records
        return NextResponse.json({
            status: "success",
            count: attendanceRecords.length,
            data: {
                class: {
                    _id: classData._id,
                    name: classData.name,
                    class: classData.class,
                    section: classData.section
                },
                records: attendanceRecords
            }
        }, { status: 200 });
        
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to fetch class attendance", error, 500);
    }
}

/**
 * PUT handler for updating attendance for a specific class on a specific date
 * Can be accessed by admins and teachers only
 */
export async function PUT(req, { params }) {
    try {
        const { user } = await verifyToken(req);
        await verifyAdminOrTeacher(req);
        await dbConnect();
        
        const classId = params.id;
        
        // Get request body
        const { date, type, period, records } = await req.json();
        
        if (!date || !type || !records || !Array.isArray(records)) {
            throw new ApiError("Missing required fields", 400);
        }
        
        if (type === "period" && !period) {
            throw new ApiError("Period name is required for period-wise attendance", 400);
        }
        
        // Verify class exists
        const classData = await Class.findById(classId);
        if (!classData) {
            throw new ApiError("Class not found", 404);
        }
        
        // Get all students in this class
        const classStudents = await User.find({
            class: classData.class,
            section: classData.section,
            role: "student"
        }).select("_id").lean();
        
        const validStudentIds = classStudents.map(std => String(std._id));
        
        // Validate each attendance record
        for (const rec of records) {
            if (!validStudentIds.includes(String(rec.studentId))) {
                throw new ApiError(
                    `Student ${rec.studentId} does not belong to class ${classData.name}`, 
                    400
                );
            }
        }
        
        // Check if attendance is already marked
        const query = {
            classId,
            date,
            type,
            ...(type === "period" && { period })
        };
        
        let attendanceDoc = await Attendance.findOne(query);
        
        if (attendanceDoc) {
            // Update existing attendance record
            attendanceDoc.students = records;
            attendanceDoc.takenBy = user._id; // Update with current user
            await attendanceDoc.save();
            
            return NextResponse.json({
                status: "updated",
                message: "Attendance updated successfully",
                data: attendanceDoc
            }, { status: 200 });
        } else {
            // Create new attendance record
            const newAttendance = await Attendance.create({
                classId,
                date,
                type,
                period: type === "period" ? period : undefined,
                students: records,
                takenBy: user._id
            });
            
            return NextResponse.json({
                status: "success",
                message: "Attendance marked successfully",
                data: newAttendance
            }, { status: 201 });
        }
        
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to update class attendance", error, 500);
    }
}