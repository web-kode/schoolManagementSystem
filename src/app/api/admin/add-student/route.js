import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { verifyAdmin, verifyToken, dbConnect, ApiError, sendLoginEmail } from "@/app/utils"
import User from '@/app/models/User';

export async function POST(req) {
    try {

        // 1️⃣ Auth checks
        await verifyToken(req);
        await verifyAdmin(req);
        await dbConnect()

        // 2️⃣ Get student data from request body
        const { name, email, rollNumber, grade, section, guardianName, dateOfBirth, gender, phone, address } = await req.json();
        if (!name || !email) {
            throw new ApiError("Required fields are missing", 400)
        }

        // 3️⃣ generate studentId
        const studentId = `${rollNumber}${grade}${section}`.toLowerCase()

        // 4️⃣ check if email or studentId already exists in db
        const existingStudent = await User.findOne({
            $or: [{ studentId: studentId }, { email: email }]
        });
        if (existingStudent) {
            if (existingStudent.studentId === studentId) {
                throw new ApiError('Student ID already exists', 400);
            }
            if (existingStudent.email === email) {
                throw new ApiError('Email is already in use by someone', 400);
            }
        }

        // 5️⃣ hash password
        const randomPassword = uuidv4().slice(0, 8);
        // const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // 6️⃣ create new student
        const newStudent = new User({
            name,
            email,
            role: "student",
            studentId,
            class: grade,
            section,
            guardianName,
            dateOfBirth,
            gender,
            phone,
            address,
            password: randomPassword
        });
        await newStudent.save()

        // 7️⃣ send email with password
        try {
            await sendLoginEmail(newStudent.email, {
                name: newStudent.name,
                email: newStudent.email,
                password: randomPassword,
            });
        } catch (error) {
            console.log("Failed to send email : ", error);
        }

        // 8️⃣ return success response
        return NextResponse.json({
            message: "Student added successfully",
            data: {
                name: newStudent.name,
                email: newStudent.email,
                studentId: newStudent.studentId
            }
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Something went wrong while adding student : ", error, 500)
    }
}