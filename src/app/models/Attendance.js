import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  date: {
    type: String, // e.g., "2025-04-21"
    required: true,
  },
  period: {
    type: String, // optional — e.g., "1", "Math", "Period 3" or null if full-day
    default: null,
  },
  students: [
    {
      student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['Present', 'Absent', 'Leave'],
        default: 'Present',
      },
    },
  ],
  takenBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Teacher/Admin who marked it
  },
  type: {
    type: String,
    enum: ['daily', 'period'],
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
