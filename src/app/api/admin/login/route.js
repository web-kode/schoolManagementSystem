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
        // console.log("User:", user);

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

        // console.log("Access:", accessToken);
        // console.log("Refresh:", refreshToken);

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

    const { email, password } = await req.json();
    if (!email || !password) {
        throw new ApiError("Email and Password are required", 400)
    }

    try {
        // find admin in DB
        const admin = await User.findOne({ email }).select("+password")
        if (!admin) {
            throw new ApiError("Email or Password is incorrect", 401);
        }

        // check if password is correct
        const isPasswordCorrect = await admin.comparePassword(password)
        if (!isPasswordCorrect) {
            throw new ApiError("Email or Password is incorrect", 401);
        }

        // generate access and refresh token
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin._id)

        // define user data to send on frontent
        const loggedInAdmin = await User.findById(admin._id)
        if(!loggedInAdmin) {
            throw new ApiError("Couldn't find logged in admin", 500)
        }


        // response
        const responseBody = {
            status: "success",
            message: "Admin logged in Successfully",
            data: { user: loggedInAdmin, accessToken, refreshToken },
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
        throw new ApiError("Something went wrong while logging admin : ", error, 500)
    }
} 