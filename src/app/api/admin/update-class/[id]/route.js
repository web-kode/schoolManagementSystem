import { NextResponse } from 'next/server';
import { dbConnect, verifyAdmin, verifyToken, ApiError } from '@/app/utils';
import Class from '@/app/models/Class';

export async function PATCH(req, { params }) {
    try {
        // 1️⃣ Auth checks
        await verifyToken(req);
        await verifyAdmin(req);
        await dbConnect();

        // 2️⃣ Get classId from params
        const { id } = await params;
        if (!id) {
            throw new ApiError("Class ID is required", 400);
        }

        // 3️⃣ Parse body
        const { classNumber, section, classTeacher, subjects } = await req.json();

        // 4️⃣ Find the class to update
        const existingClass = await Class.findById(id);
        if (!existingClass) {
            throw new ApiError("Class not found", 404);
        }

        // 5️⃣ Update fields
        if (classNumber) existingClass.class = classNumber;
        if (section) existingClass.section = section;
        if (classTeacher) existingClass.classTeacher = classTeacher;
        if (subjects) existingClass.subjects = subjects;

        // 6️⃣ Save the updated class
        await existingClass.save();

        // 7️⃣ Return success response
        return NextResponse.json({
            message: "Class updated successfully",
            data: existingClass
        }, { status: 200 });

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to update class", error, 500);
    }
}
