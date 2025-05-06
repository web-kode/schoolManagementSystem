import { NextResponse } from "next/server";
import { dbConnect, verifyToken, verifyAdmin, ApiError } from "@/app/utils";
import { Ticket, User } from "@/app/models/index.js"


// POST - Create a new ticket (for students)
export async function POST(req) {
    try {
        const {user} = await verifyToken(req);
        await dbConnect();

        // Only students can create tickets
        if (user.role !== 'student') {
            throw new ApiError("Only students can create tickets", 403);
        }

        const { subject, message, priority } = await req.json();

        // Validate inputs
        if (!subject || !message) {
            throw new ApiError("Subject and message are required", 400);
        }

        // Create the ticket
        const ticket = await Ticket.create({
            subject,
            message,
            student: user.id,
            priority: priority || 'Medium',
        });

        return NextResponse.json({
            status: "success",
            message: "Ticket created successfully",
            data: ticket
        }, { status: 201 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to create ticket", error, 500);
    }
}

// GET - Retrieve tickets with filtering options
export async function GET(req) {
    try {
        const user = await verifyToken(req);
        await dbConnect();

        const url = new URL(req.url);
        const status = url.searchParams.get('status');
        const ticketId = url.searchParams.get('id');
        const priority = url.searchParams.get('priority');

        // Build the query
        const query = {};

        // If a specific ticket ID is provided
        if (ticketId) {
            // Check if user has access to this specific ticket
            const ticket = await Ticket.findById(ticketId);

            if (!ticket) {
                throw new ApiError("Ticket not found", 404);
            }

            // Students can only access their own tickets
            if (user.role === 'student' && String(ticket.student) !== String(user.id)) {
                throw new ApiError("You don't have permission to access this ticket", 403);
            }

            return NextResponse.json({
                status: "success",
                data: await Ticket.findById(ticketId)
                    .populate('student', 'name email rollNumber class section')
                    .populate('assignedTo', 'name email')
                    .populate('closedBy', 'name email')
                    .populate('responses.sender', 'name role')
            }, { status: 200 });
        }

        // Apply filters
        if (status) query.status = status;
        if (priority) query.priority = priority;

        // Role-based access control
        if (user.role === 'student') {
            // Students can only see their own tickets
            query.student = user.id;
        } else if (user.role === 'teacher') {
            // Teachers cannot see tickets unless specifically assigned to them
            query.assignedTo = user.id;
        }
        // Admins can see all tickets (no additional filter needed)

        // Fetch tickets
        const tickets = await Ticket.find(query)
            .populate('student', 'name email rollNumber class section')
            .populate('assignedTo', 'name email')
            .select('-responses') // Exclude responses for list view to reduce payload
            .sort({ createdAt: -1 });

        // Mark tickets as read if admin is viewing
        if (user.role === 'admin' && tickets.length > 0) {
            const unreadTickets = tickets.filter(ticket => !ticket.isRead);
            if (unreadTickets.length > 0) {
                await Ticket.updateMany(
                    { _id: { $in: unreadTickets.map(t => t._id) } },
                    { $set: { isRead: true } }
                );
            }
        }

        return NextResponse.json({
            status: "success",
            count: tickets.length,
            data: tickets
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to fetch tickets", error, 500);
    }
}

// PATCH - Update ticket status or add responses (for admins and students)
export async function PATCH(req) {
    try {
        const {user} = await verifyToken(req);
        await dbConnect();

        const { ticketId, status, response, priority, assignTo } = await req.json();

        if (!ticketId) {
            throw new ApiError("Ticket ID is required", 400);
        }

        // Find the ticket
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new ApiError("Ticket not found", 404);
        }

        // Access control: Check if user has permission to update this ticket
        if (user.role === 'student' && String(ticket.student) !== String(user.id)) {
            throw new ApiError("You don't have permission to update this ticket", 403);
        }

        // Handle status changes (admin only)
        if (status && user.role === 'admin') {
            ticket.status = status;

            // If marking as closed, record who closed it and when
            if (['Resolved', 'Closed'].includes(status)) {
                ticket.closedBy = user.id;
                ticket.closedAt = new Date();
            }
        }

        // Handle priority changes (admin only)
        if (priority && user.role === 'admin') {
            ticket.priority = priority;
        }

        // Handle assignment changes (admin only)
        if (assignTo && user.role === 'admin') {
            // Verify the assigned user is an admin
            const assignedUser = await User.findById(assignTo);
            if (!assignedUser || assignedUser.role !== 'admin') {
                throw new ApiError("Tickets can only be assigned to admins", 400);
            }
            ticket.assignedTo = assignTo;
        }

        // Handle adding responses
        if (response) {
            // Students can only respond if ticket is not closed
            if (user.role === 'student' && ['Resolved', 'Closed'].includes(ticket.status)) {
                throw new ApiError("Cannot respond to a closed ticket", 400);
            }

            ticket.responses.push({
                message: response,
                sender: user.id
            });

            // When admin responds, automatically set status to In Progress if it's Open
            if (user.role === 'admin' && ticket.status === 'Open') {
                ticket.status = 'In Progress';
            }

            // Set read status based on who responded
            ticket.isRead = user.role === 'admin';
        }

        await ticket.save();

        // Fetch the updated ticket with populated fields
        const updatedTicket = await Ticket.findById(ticketId)
            .populate('student', 'name email rollNumber class section')
            .populate('assignedTo', 'name email')
            .populate('closedBy', 'name email')
            .populate('responses.sender', 'name role');

        return NextResponse.json({
            status: "success",
            message: "Ticket updated successfully",
            data: updatedTicket
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to update ticket", error, 500);
    }
}

// DELETE - Delete a ticket (admin only)
export async function DELETE(req) {
    try {
        const user = await verifyToken(req);
        await verifyAdmin(req); // Only admins can delete tickets
        await dbConnect();

        const url = new URL(req.url);
        const ticketId = url.searchParams.get('id');

        if (!ticketId) {
            throw new ApiError("Ticket ID is required", 400);
        }

        const deletedTicket = await Ticket.findByIdAndDelete(ticketId);

        if (!deletedTicket) {
            throw new ApiError("Ticket not found", 404);
        }

        return NextResponse.json({
            status: "success",
            message: "Ticket deleted successfully"
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to delete ticket", error, 500);
    }
}

// GET - Count unread tickets (admin only)
export async function HEAD(req) {
    try {
        const user = await verifyToken(req);
        await verifyAdmin(req); // Only admins need to count unread tickets
        await dbConnect();

        const unreadCount = await Ticket.countDocuments({ isRead: false });

        return NextResponse.json({
            status: "success",
            unreadCount
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to count unread tickets", error, 500);
    }
}