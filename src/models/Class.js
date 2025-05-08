import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // Example: "10A"
    },
    class: {
        type: Number,
        required: true, // Example: 10
    },
    section: {
        type: String,
        required: true, // Example: "A"
    },
    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // assuming teachers are also in the User model
    },
    subjects: [{
        name: String,
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // subject teacher
        },
    }],
}, {
    timestamps: true,
});

export default mongoose.models.Class || mongoose.model('Class', classSchema);