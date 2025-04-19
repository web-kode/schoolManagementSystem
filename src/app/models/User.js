import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const userSchema = new mongoose.Schema({
    // Common fields
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false // Exclude password from default queries
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['admin', 'teacher', 'student'],
        default: 'student'
    },
    refreshToken: {
        type: String,
    },

    // Common metadata
    isActive: {
        type: Boolean,
        default: true
    },

    // Teacher-specific fields
    subjects: [{
        type: String,
        trim: true
    }],
    classesAssigned: [{
        type: String,
        trim: true
    }],

    // Student-specific fields
    studentId: {
        type: String,
        required: true,
        trim: true
    },
    rollNumber: {
        type: String,
        trim: true,
        sparse: true // allows multiple nulls (since not all users are students)
    },
    class: {
        type: String,
        trim: true
    },
    section: {
        type: String,
        trim: true
    },
    guardianName: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },

    // Optional
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String
    },

    // auth fields
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpire: {
        type: Date
    },
},{
    timestamps: true
});

// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

// 🔐 Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// // generating a access token with jwt
// userSchema.methods.generateAccessToken = function () {
//     return jwt.sign(
//         {
//             _id: this._id,
//             name: this.name,
//             email: this.email,
//             role: this.role,
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//         }
//     )
// }

// // generating a refresh token with jwt
// userSchema.methods.generateRefreshToken = function () {
//     return jwt.sign(
//         {
//             _id: this._id,
//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//         }
//     )
// }

export default mongoose.models.User || mongoose.model('User', userSchema);
