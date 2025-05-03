import { NextResponse } from 'next/server';
import { verifyToken, verifyAdmin, dbConnect, ApiError } from "@/app/utils";
import Class from '@/app/models/Class';

export async function GET(req) {
    try {
        // 1️⃣ Auth check (ensure admin access)
        await verifyToken(req);
        await verifyAdmin(req);
        await dbConnect();

        // 2️⃣ Fetch all classes with necessary population
        const classes = await Class.find({})
            .populate('classTeacher', '_id name email')
            .populate('subjects.teacher', '_id name email')
            .sort({ class: 1, section: 1 });
        
        if(!classes) {
            return NextResponse.json({
                message: "No classes found in DB"
            },{status: 200})
        }

        // 3️⃣ Return success response with the classes
        return NextResponse.json({
            message: "Classes fetched successfully",
            data: classes,
        }, { status: 200 });
        
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError("Failed to fetch all classes", error, 500);
    }
}
