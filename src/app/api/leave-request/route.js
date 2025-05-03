import { NextResponse } from "next/server";
import { dbConnect, verifyToken, verifyAdminOrTeacher, ApiError } from "@/app/utils";
import { LeaveRequest, User, Class, Attendance } from "@/app/models/index.js"

// Helper function to get dates between start and end date
function getDatesInRange(startDate, endDate) {
  const dates = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  while (currentDate <= end) {
    dates.push(new Date(currentDate).toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// POST - Create a new leave request (for students)
export async function POST(req) {
  try {
    await verifyToken(req);
    await dbConnect();
    
    // Only students can request leaves
    if (req.user.role !== 'student') {
      throw new ApiError("Only students can request leaves", 403);
    }

    const { startDate, endDate, reason } = await req.json();
    
    // Validate inputs
    if (!startDate || !endDate || !reason) {
      throw new ApiError("Start date, end date, and reason are required", 400);
    }
    
    // Ensure startDate is not after endDate
    if (new Date(startDate) > new Date(endDate)) {
      throw new ApiError("Start date cannot be after end date", 400);
    }
    
    // Check if there's already a leave request for any of these dates
    const existingLeave = await LeaveRequest.findOne({
      student: req.user.id,
      status: { $ne: 'Rejected' }, // Not rejected
      $or: [
        // New leave starts during existing leave
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });
    
    if (existingLeave) {
      throw new ApiError("You already have a leave request that overlaps with these dates", 400);
    }
    
    // Get the student's class
    
    const student = await User.findById(req.user.id);
    if (!student) {
      throw new ApiError("Student not found", 404);
    }
    
    // Find the class ID based on class and section
    const classObj = await Class.findOne({
      class: student.class,
      section: student.section
    });
    
    if (!classObj) {
      throw new ApiError("Class not found for this student", 404);
    }
    
    // Create the leave request
    const leaveRequest = await LeaveRequest.create({
      student: req.user.id,
      class: classObj._id,
      startDate,
      endDate,
      reason
    });
    
    return NextResponse.json({
      status: "success",
      message: "Leave request submitted successfully",
      data: leaveRequest
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to submit leave request", error, 500);
  }
}

// GET - Retrieve leave requests with filtering options
export async function GET(req) {
  try {
    await verifyToken(req);
    await dbConnect();
    
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const studentId = url.searchParams.get('studentId');
    const classId = url.searchParams.get('classId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Build the query
    const query = {};
    
    // Apply filters
    if (status) query.status = status;
    if (classId) query.class = classId;
    
    // Date range filter
    if (startDate && endDate) {
      query.$or = [
        { startDate: { $gte: startDate, $lte: endDate } },
        { endDate: { $gte: startDate, $lte: endDate } },
        { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
      ];
    }
    
    // Role-based access control
    if (req.user.role === 'student') {
      // Students can only see their own leave requests
      query.student = req.user.id;
    } else if (req.user.role === 'teacher') {
      // Teachers can see leave requests from their assigned classes
      const teacherClasses = await Class.find({
        $or: [
          { classTeacher: req.user.id },
          { 'subjects.teacher': req.user.id }
        ]
      }).select('_id');
      
      const classIds = teacherClasses.map(c => c._id);
      
      if (classId && !classIds.includes(classId)) {
        throw new ApiError("You don't have access to this class", 403);
      }
      
      if (!classId) {
        query.class = { $in: classIds };
      }
    }
    // Admins can see all leave requests (no additional filter needed)
    
    // Apply student filter if provided and user is not a student
    if (studentId && req.user.role !== 'student') {
      query.student = studentId;
    }
    
    // Fetch leave requests
    const leaveRequests = await LeaveRequest.find(query)
      .populate('student', 'name rollNumber')
      .populate('class', 'name class section')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      status: "success",
      count: leaveRequests.length,
      data: leaveRequests
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to fetch leave requests", error, 500);
  }
}

// PATCH - Update leave request status (for teachers/admins)
export async function PATCH(req) {
  try {
    const user = await verifyToken(req);
    await verifyAdminOrTeacher(req); // Only teachers and admins can approve/reject
    await dbConnect();
    
    const { leaveRequestId, status, reviewNote } = await req.json();
    
    if (!leaveRequestId || !status) {
      throw new ApiError("Leave request ID and status are required", 400);
    }
    
    if (!['Approved', 'Rejected'].includes(status)) {
      throw new ApiError("Status must be either 'Approved' or 'Rejected'", 400);
    }
    
    // Find the leave request
    const leaveRequest = await LeaveRequest.findById(leaveRequestId);
    
    if (!leaveRequest) {
      throw new ApiError("Leave request not found", 404);
    }
    
    // Check if the teacher has access to this class
    if (user.role === 'teacher') {
      const hasAccess = await Class.exists({
        _id: leaveRequest.class,
        $or: [
          { classTeacher: user._id },
          { 'subjects.teacher': user._id }
        ]
      });
      
      if (!hasAccess) {
        throw new ApiError("You don't have permission to review leave requests for this class", 403);
      }
    }
    
    // If the leave is already reviewed, prevent changes
    if (leaveRequest.status !== 'Pending') {
      throw new ApiError(`This leave request has already been ${leaveRequest.status.toLowerCase()}`, 400);
    }
    
    // Update leave request status
    leaveRequest.status = status;
    leaveRequest.reviewedBy = user._id;
    leaveRequest.reviewedAt = new Date();
    
    if (reviewNote) {
      leaveRequest.reviewNote = reviewNote;
    }
    
    await leaveRequest.save();
    
    // If approved, update attendance records to mark "Leave" for those days
    if (status === 'Approved') {
      const datesToMark = getDatesInRange(leaveRequest.startDate, leaveRequest.endDate);
      
      // For each date in the range, update all attendance records
      for (const date of datesToMark) {
        // Find all attendance records for this class and date
        const attendanceRecords = await Attendance.find({
          classId: leaveRequest.class,
          date
        });
        
        // Update each attendance record
        for (const record of attendanceRecords) {
          // Find the student in the attendance record
          const studentIndex = record.students.findIndex(
            s => String(s.student) === String(leaveRequest.student)
          );
          
          if (studentIndex >= 0) {
            // Student exists in attendance, update to Leave
            record.students[studentIndex].status = 'Leave';
          } else {
            // Student not in attendance yet, add them with Leave status
            record.students.push({
              student: leaveRequest.student,
              status: 'Leave'
            });
          }
          
          await record.save();
        }
      }
    }
    
    return NextResponse.json({
      status: "success",
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leaveRequest
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to update leave request", error, 500);
  }
}

// DELETE - Cancel a leave request (only for pending requests by the student)
export async function DELETE(req) {
  try {
    const user = await verifyToken(req);
    await dbConnect();
    
    const url = new URL(req.url);
    const leaveRequestId = url.searchParams.get('id');
    
    if (!leaveRequestId) {
      throw new ApiError("Leave request ID is required", 400);
    }
    
    // Find the leave request
    const leaveRequest = await LeaveRequest.findById(leaveRequestId);
    
    if (!leaveRequest) {
      throw new ApiError("Leave request not found", 404);
    }
    
    // Only the student who created the request or admins can delete it
    if (user.role === 'student' && String(leaveRequest.student) !== String(user._id)) {
      throw new ApiError("You can only cancel your own leave requests", 403);
    }
    
    // Only pending requests can be cancelled
    if (leaveRequest.status !== 'Pending' && user.role !== 'admin') {
      throw new ApiError(`Cannot cancel a request that has already been ${leaveRequest.status.toLowerCase()}`, 400);
    }
    
    // Delete the leave request
    await LeaveRequest.findByIdAndDelete(leaveRequestId);
    
    return NextResponse.json({
      status: "success",
      message: "Leave request cancelled successfully"
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to cancel leave request", error, 500);
  }
}