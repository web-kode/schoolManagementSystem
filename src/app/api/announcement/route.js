import { NextResponse } from "next/server";
import { dbConnect, verifyToken, verifyAdminOrTeacher, ApiError } from "@/app/utils";
import { Announcement, User, Class } from "@/app/models";

// POST - Create a new announcement (for admins and teachers)
export async function POST(req) {
    try {
        const {user} = await verifyToken(req);
        await verifyAdminOrTeacher(req); // Only admins and teachers
        await dbConnect();

        const {
            title,
            content,
            targetAudience,
            targetClasses,
            targetStudents,
            important,
            expiryDate,
            attachments,
            acknowledgementRequired
        } = await req.json();

        // Validate basic inputs
        if (!title || !content || !targetAudience) {
            throw new ApiError("Title, content, and target audience are required", 400);
        }

        // Validate audience-specific fields
        if (targetAudience === 'classes' && (!targetClasses || !targetClasses.length)) {
            throw new ApiError("Target classes must be specified when audience is 'classes'", 400);
        }

        if (targetAudience === 'students' && (!targetStudents || !targetStudents.length)) {
            throw new ApiError("Target students must be specified when audience is 'students'", 400);
        }

        // Validate class IDs if targeting classes
        if (targetAudience === 'classes') {
            for (const classId of targetClasses) {
                const classExists = await Class.exists({ _id: classId });
                if (!classExists) {
                    throw new ApiError(`Class with ID ${classId} does not exist`, 400);
                }
            }
        }

        // Validate student IDs if targeting students
        if (targetAudience === 'students') {
            for (const studentId of targetStudents) {
                const student = await User.findOne({ _id: studentId, role: 'student' });
                if (!student) {
                    throw new ApiError(`Student with ID ${studentId} does not exist or is not a student`, 400);
                }
            }
        }

        // Create the announcement
        const announcement = await Announcement.create({
            title,
            content,
            author: user.id,
            targetAudience,
            targetClasses: targetAudience === 'classes' ? targetClasses : [],
            targetStudents: targetAudience === 'students' ? targetStudents : [],
            important: important || false,
            expiryDate: expiryDate || undefined,
            attachments: attachments || [],
            acknowledgementRequired: acknowledgementRequired || false
        });

        return NextResponse.json({
            status: "success",
            message: "Announcement created successfully",
            data: announcement
        }, { status: 201 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to create announcement", error, 500);
    }
}

// GET - Retrieve announcements with filtering options
export async function GET(req) {
    try {
        const {user} = await verifyToken(req);
        await dbConnect();

        const url = new URL(req.url);
        const announcementId = url.searchParams.get('id');
        const showAll = url.searchParams.get('all') === 'true';
        const createdBy = url.searchParams.get('createdBy');
        const important = url.searchParams.get('important') === 'true';

        // If requesting a specific announcement
        if (announcementId) {
            const announcement = await Announcement.findById(announcementId)
                .populate('author', 'name role')
                .populate('targetClasses', 'name class section')
                .populate('targetStudents', 'name rollNumber class section')
                .populate('acknowledgements.user', 'name role');

            if (!announcement) {
                throw new ApiError("Announcement not found", 404);
            }

            // Check if the user has access to this announcement
            const hasAccess = await userHasAccessToAnnouncement(user, announcement);
            if (!hasAccess && user.role === 'student') {
                throw new ApiError("You don't have access to this announcement", 403);
            }

            // If student is accessing, mark as acknowledged if required
            if (user.role === 'student' && announcement.acknowledgementRequired) {
                const alreadyAcknowledged = announcement.acknowledgements.some(ack =>
                    String(ack.user._id) === String(user.id)
                );

                if (!alreadyAcknowledged) {
                    announcement.acknowledgements.push({
                        user: user.id,
                        timestamp: new Date()
                    });
                    await announcement.save();
                }
            }

            return NextResponse.json({
                status: "success",
                data: announcement
            }, { status: 200 });
        }

        // Build query for listing announcements
        const query = {};
        const currentDate = new Date();

        // Only show non-expired announcements unless explicitly requesting all
        if (!showAll) {
            query.expiryDate = { $gt: currentDate };
        }

        // Filter by importance if requested
        if (important) {
            query.important = true;
        }

        // Filter by author if requested and user is admin/teacher
        if (createdBy && (user.role === 'admin' || user.role === 'teacher')) {
            query.author = createdBy;
        }

        // For admins and teachers: get all announcements or filter by creation
        let announcements = [];

        if (user.role === 'admin' || user.role === 'teacher') {
            announcements = await Announcement.find(query)
                .populate('author', 'name role')
                .populate('targetClasses', 'name')
                .sort({ createdAt: -1 });
        }
        // For students: only get announcements they should see
        else if (user.role === 'student') {
            // Get student's class
            const student = await User.findById(user.id);
            const studentClass = await Class.findOne({
                class: student.class,
                section: student.section
            });

            if (!studentClass) {
                return NextResponse.json({
                    status: "success",
                    count: 0,
                    data: []
                }, { status: 200 });
            }

            announcements = await Announcement.find({
                $and: [
                    { expiryDate: { $gt: currentDate } },
                    {
                        $or: [
                            { targetAudience: 'all' },
                            { targetAudience: 'classes', targetClasses: studentClass._id },
                            { targetAudience: 'students', targetStudents: user.id }
                        ]
                    }
                ]
            })
                .populate('author', 'name role')
                .sort({ important: -1, createdAt: -1 });

            // Add acknowledgement status for students
            announcements = announcements.map(announcement => {
                const doc = announcement.toObject();
                doc.hasAcknowledged = announcement.acknowledgements.some(
                    ack => String(ack.user) === String(user.id)
                );
                return doc;
            });
        }

        return NextResponse.json({
            status: "success",
            count: announcements.length,
            data: announcements
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to fetch announcements", error, 500);
    }
}

// PATCH - Update an announcement (only for the author or admin)
export async function PATCH(req) {
    try {
        const {user} = await verifyToken(req);
        await verifyAdminOrTeacher(req);
        await dbConnect();

        const {
            id,
            title,
            content,
            targetAudience,
            targetClasses,
            targetStudents,
            important,
            expiryDate,
            attachments,
            acknowledgementRequired
        } = await req.json();

        if (!id) {
            throw new ApiError("Announcement ID is required", 400);
        }

        // Find the announcement
        const announcement = await Announcement.findById(id);

        if (!announcement) {
            throw new ApiError("Announcement not found", 404);
        }

        // Check if user has permission to update (must be author or admin)
        if (String(announcement.author) !== String(user.id) && user.role !== 'admin') {
            throw new ApiError("You don't have permission to update this announcement", 403);
        }

        // Update fields if provided
        if (title) announcement.title = title;
        if (content) announcement.content = content;

        // Handle audience targeting changes
        if (targetAudience) {
            announcement.targetAudience = targetAudience;

            // Reset target collections when changing audience type
            if (targetAudience === 'all') {
                announcement.targetClasses = [];
                announcement.targetStudents = [];
            }
            else if (targetAudience === 'classes' && targetClasses) {
                // Validate classes
                for (const classId of targetClasses) {
                    const classExists = await Class.exists({ _id: classId });
                    if (!classExists) {
                        throw new ApiError(`Class with ID ${classId} does not exist`, 400);
                    }
                }
                announcement.targetClasses = targetClasses;
                announcement.targetStudents = [];
            }
            else if (targetAudience === 'students' && targetStudents) {
                // Validate students
                for (const studentId of targetStudents) {
                    const student = await User.findOne({ _id: studentId, role: 'student' });
                    if (!student) {
                        throw new ApiError(`Student with ID ${studentId} does not exist or is not a student`, 400);
                    }
                }
                announcement.targetStudents = targetStudents;
                announcement.targetClasses = [];
            }
        }

        // Update other fields if provided
        if (important !== undefined) announcement.important = important;
        if (expiryDate) announcement.expiryDate = expiryDate;
        if (attachments) announcement.attachments = attachments;
        if (acknowledgementRequired !== undefined) {
            // If changing from not required to required, keep existing acknowledgements
            announcement.acknowledgementRequired = acknowledgementRequired;
        }

        await announcement.save();

        // Get the updated announcement with populated fields
        const updatedAnnouncement = await Announcement.findById(id)
            .populate('author', 'name role')
            .populate('targetClasses', 'name class section')
            .populate('targetStudents', 'name rollNumber class section')
            .populate('acknowledgements.user', 'name role');

        return NextResponse.json({
            status: "success",
            message: "Announcement updated successfully",
            data: updatedAnnouncement
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to update announcement", error, 500);
    }
}

// DELETE - Delete an announcement (only for the author or admin)
export async function DELETE(req) {
    try {
        const {user} = await verifyToken(req);
        await verifyAdminOrTeacher(req);
        await dbConnect();

        const url = new URL(req.url);
        const id = url.searchParams.get('id');

        if (!id) {
            throw new ApiError("Announcement ID is required", 400);
        }

        // Find the announcement
        const announcement = await Announcement.findById(id);

        if (!announcement) {
            throw new ApiError("Announcement not found", 404);
        }

        // Check if user has permission to delete (must be author or admin)
        if (String(announcement.author) !== String(user.id) && user.role !== 'admin') {
            throw new ApiError("You don't have permission to delete this announcement", 403);
        }

        // Delete the announcement
        await Announcement.findByIdAndDelete(id);

        return NextResponse.json({
            status: "success",
            message: "Announcement deleted successfully"
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to delete announcement", error, 500);
    }
}

// Helper function to check if a user has access to an announcement
async function userHasAccessToAnnouncement(user, announcement) {
    // Admins and teachers can access all announcements
    if (user.role === 'admin' || user.role === 'teacher') {
        return true;
    }

    // For students, check if they are in the target audience
    if (user.role === 'student') {
        // If announcement is for everyone
        if (announcement.targetAudience === 'all') {
            return true;
        }

        // If announcement targets specific students
        if (announcement.targetAudience === 'students') {
            return announcement.targetStudents.some(student =>
                String(student) === String(user._id)
            );
        }

        // If announcement targets specific classes
        if (announcement.targetAudience === 'classes') {
            // Get student's class
            const student = await User.findById(user._id);
            const studentClass = await Class.findOne({
                class: student.class,
                section: student.section
            });

            if (!studentClass) return false;

            return announcement.targetClasses.some(classId =>
                String(classId) === String(studentClass._id)
            );
        }
    }

    return false;
}