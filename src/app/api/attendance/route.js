import { NextResponse } from "next/server";
import { dbConnect, verifyToken, verifyAdminOrTeacher, ApiError } from "../../../utils/index.js";
import { LeaveRequest, User, Class, Attendance } from "../../../models/index.js"

// This function checks if a student is on approved leave for a given date
async function checkStudentLeave(studentId, date) {
    const leaveRequest = await LeaveRequest.findOne({
        student: studentId,
        status: 'Approved',
        startDate: { $lte: date },
        endDate: { $gte: date }
    });

    return !!leaveRequest; // Returns true if student is on approved leave
}

// POST route for marking/updating attendance (daily or period-wise)
export async function POST(req) {
    try {
        await verifyToken(req);
        await verifyAdminOrTeacher(req)
        await dbConnect();

        const { classId, date, type, period, records, takenBy } = await req.json();

        if (!classId || !date || !type || !takenBy || !records || !Array.isArray(records)) {
            throw new ApiError("Missing required fields", 400);
        }

        if (type === "period" && !period) {
            throw new ApiError("Period name is required for period-wise attendance", 400);
        }

        // 1. Fetch the class object
        const targetClass = await Class.findById(classId);
        if (!targetClass) throw new ApiError("Class not found", 404);
        // console.log("target class : ", targetClass)

        // 2. Get students using class and section fields
        const classStudents = await User.find({
            class: targetClass.class, // '10' as string
            section: targetClass.section     // 'A'
        }).select("_id").lean();
        // console.log("class student id's : ", classStudents)

        // 3. Extract valid student IDs
        const validStudentIds = classStudents.map(std => String(std._id));
        // console.log("valid student id's : ", validStudentIds);

        // 4. Validate each attendance record
        for (const rec of records) {
            if (!validStudentIds.includes(String(rec.studentId))) {
                throw new ApiError(`Student ${rec.studentId} does not belong to class ${targetClass.name}`, 400);
            }
        }

        // 5. check if attendance is already marked
        const query = {
            classId,
            date,
            type,
            ...(type === "period" && { period })
        };
        const attendanceDoc = await Attendance.findOne(query);

        console.log("New attendance : : ", records);

        // 6. if attendance is already marked update the document
        if (attendanceDoc) {
            const updatedStudents = [];

            for (const rec of records) {
                // Check if student is on approved leave for this date
                const isOnLeave = await checkStudentLeave(rec.studentId, date);

                // If student is on approved leave, keep status as 'Leave'
                // Otherwise use the provided status
                const status = isOnLeave ? 'Leave' : rec.status;

                updatedStudents.push({
                    student: rec.studentId,
                    status: status
                });
            }

            attendanceDoc.students = updatedStudents;
            attendanceDoc.takenBy = takenBy;
            await attendanceDoc.save();

            return NextResponse.json({
                status: "updated",
                message: "Attendance updated successfully",
                data: attendanceDoc
            }, { status: 200 });
        }

        // 7. if not then create new attendance and put attendance in students array also add takenBy field
        const newAttendanceStudents = [];

        // Process each student record
        for (const rec of records) {
            // Check if student is on approved leave for this date
            const isOnLeave = await checkStudentLeave(rec.studentId, date);

            // If student is on approved leave, override status to 'Leave'
            const status = isOnLeave ? 'Leave' : rec.status;

            newAttendanceStudents.push({
                student: rec.studentId,
                status: status
            });
        }

        const newAttendance = await Attendance.create({
            classId,
            date,
            type,
            period: type === "period" ? period : undefined,
            students: newAttendanceStudents,
            takenBy
        });

        // 8. return response
        return NextResponse.json({
            status: "success",
            message: "Attendance marked successfully",
            data: newAttendance
        }, { status: 201 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to mark attendance", error, 500);
    }
}

// GET route for retrieving attendance records with filtering options
export async function GET(req) {
    try {
        await verifyToken(req);
        await dbConnect();

        // Parse query parameters
        const url = new URL(req.url);
        const classId = url.searchParams.get('classId');
        const date = url.searchParams.get('date');
        const period = url.searchParams.get('period');
        const type = url.searchParams.get('type');
        const studentId = url.searchParams.get('studentId');
        const startDate = url.searchParams.get('startDate');
        const endDate = url.searchParams.get('endDate');

        // Build query object
        const query = {};

        if (classId) query.classId = classId;
        if (date) query.date = date;
        if (period) query.period = period;
        if (type) query.type = type;

        // Date range query
        if (startDate && endDate) {
            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        // Fetch attendance records
        let attendanceRecords;

        if (studentId) {
            // If looking for a specific student's attendance
            attendanceRecords = await Attendance.find({
                ...query,
                'students.student': studentId
            })
                .populate('classId', 'name class section')
                .populate('takenBy', 'name')
                .populate('students.student', 'name rollNumber');
        } else {
            // Get all attendance records based on filters
            attendanceRecords = await Attendance.find(query)
                .populate('classId', 'name class section')
                .populate('takenBy', 'name')
                .populate('students.student', 'name rollNumber');
        }

        return NextResponse.json({
            status: "success",
            count: attendanceRecords.length,
            data: attendanceRecords
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to fetch attendance records", error, 500);
    }
}

// DELETE route for removing an attendance record
export async function DELETE(req) {
    try {
        await verifyToken(req);
        await verifyAdminOrTeacher(req);
        await dbConnect();

        const url = new URL(req.url);
        const attendanceId = url.searchParams.get('id');

        if (!attendanceId) {
            throw new ApiError("Attendance ID is required", 400);
        }

        const deletedAttendance = await Attendance.findByIdAndDelete(attendanceId);

        if (!deletedAttendance) {
            throw new ApiError("Attendance record not found", 404);
        }

        return NextResponse.json({
            status: "success",
            message: "Attendance record deleted successfully"
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to delete attendance record", error, 500);
    }
}
