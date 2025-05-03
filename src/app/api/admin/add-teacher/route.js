import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { verifyAdmin, verifyToken, dbConnect, ApiError, sendLoginEmail } from "@/app/utils"
import User from '@/app/models/User';

export async function POST(req) {
    try {
        // 1️⃣ Auth & DB Connect
        await verifyToken(req);
        await verifyAdmin(req);
        await dbConnect();

        // 2️⃣ Get data from request
        const { name, email, subjects = [], classesAssigned = [], phone, address } = await req.json();
        if (!name || !email) {
            throw new ApiError("Name and Email are required", 400);
        }

        // 3️⃣ Check if email already exists
        const existingTeacher = await User.findOne({ email });
        if (existingTeacher) {
            throw new ApiError("Email is already in use", 400);
        }

        // 4️⃣ Generate password
        const randomPassword = uuidv4().slice(0, 8);
        // const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // 5️⃣ Create teacher
        const newTeacher = new User({
            name,
            email,
            role: 'teacher',
            subjects,
            classesAssigned,
            phone,
            address,
            password: randomPassword
        });
        await newTeacher.save();

        // 6️⃣ Send login email
        try {
            await sendLoginEmail(email, {
                name,
                email,
                password: randomPassword
            });
            console.log("Email sent successfully");
            
        } catch (err) {
            console.error("Email sending failed: ", err);
        }

        // 7️⃣ Respond
        return NextResponse.json({
            message: "Teacher added successfully",
            data: {
                name: newTeacher.name,
                email: newTeacher.email,
                id: newTeacher._id
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Add teacher error: ", error);
        if (error instanceof ApiError) throw error;
        throw new ApiError("Something went wrong while adding teacher", error, 500);
    }
}