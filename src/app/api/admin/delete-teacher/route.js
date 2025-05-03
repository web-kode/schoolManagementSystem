import { NextResponse } from 'next/server';
import { verifyAdmin, verifyToken, dbConnect, ApiError } from "@/app/utils";
import User from '@/app/models/User';

export async function POST(req) {
  try {
    // 1️⃣ Auth
    await verifyToken(req);
    await verifyAdmin(req);
    await dbConnect();

    // 2️⃣ Get teacher identifier
    const { id } = await req.json();
    if (!id) {
      throw new ApiError("Id is required to delete teacher", 400);
    }

    // 3️⃣ Find and delete
    const deleted = await User.findOneAndDelete({
      _id: id,
      role: 'teacher'
    });

    if (!deleted) {
      throw new ApiError("Teacher not found", 404);
    }

    // 4️⃣ Return success
    return NextResponse.json({
      message: "Teacher deleted successfully",
      data: {
        name: deleted.name,
        email: deleted.email,
        _id: deleted._id
      }
    }, { status: 200 });

  } catch (error) {
    if (error instanceof ApiError) {
        throw error;
    }
    throw new ApiError("Something went wrong while deleting teacher : ", error, 500)
  }
}
