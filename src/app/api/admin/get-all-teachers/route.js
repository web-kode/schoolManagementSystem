import { NextResponse } from "next/server";
import { dbConnect, verifyToken, verifyAdmin, ApiError } from "@/app/utils";
import User from "@/app/models/User";

export async function GET(req) {
  try {
    // 1️⃣ Auth checks
    await verifyToken(req);
    await verifyAdmin(req);
    await dbConnect();

    // 2️⃣ Fetch teachers, project only needed fields and sort by name
    const teachers = await User.find({ role: "teacher" })
      .select("_id name email subjects classesAssigned")
      .sort({ name: 1 }); // 1 for ascending (A-Z)

    if(teachers.length == 0) {
      return NextResponse.json({
        message: "No teachers found in database",
      }, { status: 200 });
    }

    // 3️⃣ Return response
    return NextResponse.json({
      message: "All teachers fetched successfully",
      data: teachers,
    }, { status: 200 });

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Something went wrong while fetching all teachers : ", error, 500)
  }
}
