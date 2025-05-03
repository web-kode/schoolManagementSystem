import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    startDate: {
        type: String, // e.g., "2025-04-21"
        required: true
    },
    endDate: {
        type: String, // e.g., "2025-04-23"
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Teacher/Admin who reviewed it
        default: null
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    reviewNote: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Create an index on student and date range to efficiently query overlapping leaves
leaveRequestSchema.index({ student: 1, startDate: 1, endDate: 1 });

export default mongoose.models.LeaveRequest || mongoose.model('LeaveRequest', leaveRequestSchema);