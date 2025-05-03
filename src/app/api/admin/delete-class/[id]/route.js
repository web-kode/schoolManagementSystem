import { NextResponse } from 'next/server';
import { dbConnect, verifyAdmin, verifyToken, ApiError } from '@/app/utils';
import Class from '@/app/models/Class';

export async function DELETE(req, { params }) {
  try {
    // 1️⃣ Auth Checks
    await verifyToken(req);
    await verifyAdmin(req);
    await dbConnect();

    // 2️⃣ Get class ID from params
    const classId = await params.id;
    if (!classId) {
      throw new ApiError("Class ID is required", 400);
    }

    // 3️⃣ Delete class
    const deleted = await Class.findByIdAndDelete(classId);

    if (!deleted) {
      throw new ApiError("Class not found", 404);
    }

    // 4️⃣ Return success response
    return NextResponse.json({
      message: "Class deleted successfully",
      data: deleted
    }, { status: 200 });

  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Failed to delete class", error, 500);
  }
}
