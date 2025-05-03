import { NextResponse } from 'next/server';
import { verifyAdmin, verifyToken, dbConnect, ApiError } from "@/app/utils";
import User from '@/app/models/User';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    // 1️⃣ Auth
    await verifyToken(req);
    await verifyAdmin(req);
    await dbConnect();

    // 2️⃣ Get student identifier
    const { id } = await req.json();
    if (!id) {
      throw new ApiError("studentId or id is required to delete student", 400);
    }

    // 3️⃣ Build a flexible query
    const query = [
        { studentId: id }
    ];
    
    if (mongoose.Types.ObjectId.isValid(id)) {
        query.push({ _id: id });
    }

    // 3️⃣ Find and delete
    const deleted = await User.findOneAndDelete({
      $or: query,
      role: 'student'
    });

    if (!deleted) {
      throw new ApiError("Student not found", 404);
    }

    // 4️⃣ Return success
    return NextResponse.json({
      message: "Student deleted successfully",
      data: {
        name: deleted.name,
        email: deleted.email,
        studentId: deleted.studentId
      }
    }, { status: 200 });

  } catch (error) {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError("Something went wrong while deleting student : ", error, 500)
  }
}
