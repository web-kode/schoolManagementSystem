import User from "@/app/models/User";
import { dbConnect, ApiError, verifyToken, ApiResponse } from "@/app/utils";

export async function GET(req) {
  try {
    await verifyToken(req);
    await dbConnect();

    // 1️⃣ Get userId
    const userId = req.user.id
    if (!userId) {
      throw new ApiError("UserID not found from token", 404)
    }

    // 2️⃣ Find user by email
    const user = await User.findOne({ _id: userId })
      .select("-password -refreshToken -resetPasswordToken -resetPasswordExpire")
      .lean();

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    // 3️⃣ Return user info
    return Response.json(new ApiResponse(200, user, "User data fetched successfully"));

  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Something went wrong while fetching current user data : ", error, 500)
  }
}
