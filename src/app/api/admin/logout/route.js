import { NextResponse } from "next/server";
import { verifyToken, ApiResponse, ApiError } from "@/app/utils";

export async function POST(req) {
    try {
        // check if admin is logged in
        await verifyToken(req);

        // Clear the cookies by setting empty strings and immediate expiry
        const response = NextResponse.json(
            new ApiResponse(200, null, "Admin logged out successfully")
        );

        response.cookies.set("accessToken", "", {
            httpOnly: true,
            secure: true,
            expires: new Date(0), // Immediately expire
        });

        response.cookies.set("refreshToken", "", {
            httpOnly: true,
            secure: true,
            expires: new Date(0),
        });

        return response;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Something went wrong during logging out admin : ", error, 500)

    }
}