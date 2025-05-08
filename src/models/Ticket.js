import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    responses: [{
        message: {
            type: String,
            required: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isRead: {
        type: Boolean,
        default: false
    },
    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    closedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Create index on student and status for efficient queries
ticketSchema.index({ student: 1, status: 1 });
ticketSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);