import User from "@/app/models/User";
import jwt from "jsonwebtoken"
import { dbConnect, ApiError } from "@/app/utils";

import dotenv from 'dotenv';
import { NextResponse } from "next/server";
dotenv.config({ path: '.env' });
const {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_ACCESS_EXPIRATION,
    JWT_REFRESH_EXPIRATION
} = process.env;

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        // Finding user by userId; ensure this returns a hydrated Mongoose document.
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        console.log("User:", user);

        // Manually generate tokens without calling instance methods
        const accessToken = jwt.sign(
            { id: user._id.toString(), role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_ACCESS_EXPIRATION }
        );

        const refreshToken = jwt.sign(
            { id: user._id.toString(), role: user.role },
            JWT_REFRESH_SECRET,
            { expiresIn: JWT_REFRESH_EXPIRATION }
        );

        console.log("Access:", accessToken);
        console.log("Refresh:", refreshToken);

        // Save the refresh token in the database (if needed)
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        // Return the tokens
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while generating tokens");
    }
};

export async function POST(req) {

    await dbConnect();

    // Taking loginId as email or studentId
    const { loginId, password } = await req.json();
    if (!loginId || !password) {
        throw new ApiError("LoginID and Password are required", 400)
    }

    try {
        // find user in DB
        const user = await User.findOne({
            $or: [{ email: loginId }, { studentId: loginId.toLowerCase() }],
        }).select("+password")
        if (!user) {
            throw new ApiError("LoginID or Password is incorrect", 401);
        }

        // check if password is correct
        const isPasswordCorrect = await user.comparePassword(password)
        if (!isPasswordCorrect) {
            throw new ApiError("LoginID or Password is incorrect", 401);
        }

        // generate access and refresh token
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        // define user data to send on frontent
        const loggedInUser = await User.findById(user._id)
        if (!loggedInUser) {
            throw new ApiError("Couldn't find logged in User", 500)
        }


        // response
        const responseBody = {
            status: "success",
            message: "User logged in Successfully",
            data: { user: loggedInUser, accessToken, refreshToken },
        };
        const response = NextResponse.json(responseBody, { status: 200 });

        // Set cookies
        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            path: "/",
        });
        response.cookies.set("refreshToken", refreshToken, {
            httpOnly: true,
            path: "/",
        });

        return response;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Something went wrong while logging User : ", error, 500)
    }
} 