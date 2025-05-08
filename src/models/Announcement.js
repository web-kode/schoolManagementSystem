import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetAudience: {
        type: String,
        enum: ['all', 'classes', 'students'],
        required: true,
        default: 'all'
    },
    targetClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    targetStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    important: {
        type: Boolean,
        default: false
    },
    expiryDate: {
        type: Date,
        default: function () {
            // Default expiry is 30 days from creation
            const date = new Date();
            date.setDate(date.getDate() + 30);
            return date;
        }
    },
    attachments: [{
        name: String,
        url: String,
        type: String // file type for display purposes
    }],
    acknowledgementRequired: {
        type: Boolean,
        default: false
    },
    acknowledgements: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Create indexes for efficient queries
announcementSchema.index({ author: 1, createdAt: -1 });
announcementSchema.index({ targetAudience: 1 });
announcementSchema.index({ targetClasses: 1 });
announcementSchema.index({ targetStudents: 1 });
announcementSchema.index({ expiryDate: 1 });

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);