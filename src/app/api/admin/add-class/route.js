import { NextResponse } from 'next/server';
import { dbConnect, verifyAdmin, verifyToken, ApiError } from '@/app/utils';
import Class from '@/app/models/Class';

export async function POST(req) {
    try {
        // 1️⃣ Auth checks
        await verifyToken(req);
        await verifyAdmin(req);
        await dbConnect();

        // 2️⃣ Parse body
        const { classNumber, section, classTeacher, subjects } = await req.json();
        if (!classNumber || !section) {
            throw new ApiError("Class and section are required", 400);
        }

        // 3️⃣ Generate unique class name
        const name = `${classNumber}${section}`.toUpperCase();

        // 4️⃣ Check if class already exists
        const existing = await Class.findOne({ name });
        if (existing) {
            throw new ApiError(`Class ${name} already exists`, 400);
        }

        // 5️⃣ Create class
        const newClass = new Class({
            name,
            class: classNumber,
            section,
            classTeacher: classTeacher || null,
            subjects: subjects || [],
        });
        await newClass.save();

        // 6️⃣ Return success
        return NextResponse.json({
            message: "Class added successfully",
            data: newClass
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to add class", error, 500);
    }
}
