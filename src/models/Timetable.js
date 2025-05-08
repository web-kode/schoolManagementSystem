import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    week: [{
        day: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            required: true
        },
        periods: [{
            startTime: String,  // e.g., "09:00"
            endTime: String,    // e.g., "09:40"
            subject: String,    // e.g., "Math"
            teacher: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'       // Reference to teacher
            }
        }]
    }]
}, {
    timestamps: true,
});

export default mongoose.models.Timetable || mongoose.model('Timetable', timetableSchema);
