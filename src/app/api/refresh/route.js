import jwt from 'jsonwebtoken';
import { ApiError } from '@/app/utils';
import { cookies } from 'next/headers';
import dotenv from "dotenv"
import { NextResponse } from 'next/server';

dotenv.config({ path: '.env' });

export async function POST(req) {
    try {
        // refresh token from cookies
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;
        // const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            throw new ApiError("No refresh token provided", 401);
        }
    
        // check if refresh token is valid
        const isValid = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        if (!isValid) {
            throw new ApiError("Invalid refresh token", 401);
        }
        
        // Generate a new access token
        const newAccessToken = jwt.sign(
            { id: isValid.id.toString(), role: isValid.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
        );

        // response
        const responseBody = {
            status: "success",
            message: "Access token refreshed Successfully",
            data: { accessToken: newAccessToken },
        };
        const response = NextResponse.json(responseBody, { status: 200 });

        // Set cookies
        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            path: "/",
        });

        return response;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Error while refreshing access token : ERROR :: ",error, 500);
    }
};
