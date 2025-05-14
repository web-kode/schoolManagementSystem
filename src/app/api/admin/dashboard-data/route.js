import { dbConnect, ApiError, verifyAdmin, verifyToken } from "../../../../utils/index"
import { NextResponse } from "next/server"
import { User, Class, Attendance } from "../../../../models/index"

export async function GET(req, { params }) {
    try {

        // verify admin
        await verifyToken(req)
        await verifyAdmin(req)
        await dbConnect()

        // ----- total counts end -----
        // get total counts
        const studentCount = await User.countDocuments({ role: 'student' });
        const teacherCount = await User.countDocuments({ role: 'teacher' });
        const classCount = await Class.countDocuments()

        // format yesterday's date
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yyyy = yesterday.getFullYear();
        const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
        const dd = String(yesterday.getDate()).padStart(2, '0');
        const formattedDate = `${yyyy}-${mm}-${dd}`;

        // Get attendance entries for yesterday
        const attendances = await Attendance.find({ date: formattedDate });
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLeave = 0;
        let totalNotMarked = 0;
        attendances.forEach((attendance) => {
            attendance.students.forEach((entry) => {
                if (entry.status === 'Present') {
                    totalPresent++;
                } else if (entry.status === 'Absent') {
                    totalAbsent++;
                } else if (entry.status === 'Leave') {
                    totalLeave++;
                } else {
                    totalNotMarked++;
                }
            });
        });

        // get total percentage of yesterday's attendance
        const percentage = studentCount === 0 ? 0 : ((totalPresent / studentCount) * 100).toFixed(2);

        // ----- total counts end -----

        // ----- 7 days attendance data start -----

        // get last 7 days' dates (including today)
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const formatted = date.toISOString().split("T")[0]; // 'YYYY-MM-DD'
            dates.push(formatted);
        }

        // get attendance entries for last 7 days
        const results = [];
        for (let date of dates) {
            const attendances = await Attendance.find({ date });
            let presentCount = 0;
            attendances.forEach(record => {
                presentCount += record.students.filter(s => s.status === "Present").length;
            });
            const percentage = studentCount === 0
                ? 0
                : ((presentCount / studentCount) * 100).toFixed(2);

            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
            results.push({
                date: formattedDate,
                percentage: parseFloat(percentage),
            });
            // results.reverse();
        }

        // ----- 7 days attendance data end -----

        // ----- attendances of all classes start -----
        const allClasses = await Class.find();
        const attendanceResults = [];

        for (const classItem of allClasses) {
            const attendance = await Attendance.findOne({
                classId: classItem._id,
                date: formattedDate,
            });
            if (attendance) {
                let present = 0, absent = 0, leave = 0;
                attendance.students.forEach(s => {
                    if (s.status === "Present") present++;
                    else if (s.status === "Absent") absent++;
                    else if (s.status === "Leave") leave++;
                });
                attendanceResults.push({
                    classId: classItem._id,
                    className: classItem.name,
                    present,
                    absent,
                    leave,
                    status: "Marked",
                });
            } else {
                attendanceResults.push({
                    classId: classItem._id,
                    className: classItem.name,
                    present: 0,
                    absent: 0,
                    leave: 0,
                    status: "Not Marked",
                });
            }
        }
        console.log("TEST :: ", attendanceResults);
        

        // ----- attendances of all classes end -----

        // return response
        return NextResponse.json({
            date: formattedDate,
            totalCounts: {
                studentCount,
                teacherCount,
                classCount,
                percentage,
            },
            attendances: {
                totalPresent,
                totalAbsent,
                totalLeave,
                totalNotMarked,
            },
            results,
            attendanceResults
        });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to fetch admin dashboard data', error, 500);
    }
}