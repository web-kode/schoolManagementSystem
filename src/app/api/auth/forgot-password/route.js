import { NextResponse } from "next/server";
import { dbConnect, ApiError, sendResetPasswordEmail } from "@/app/utils";
import crypto from 'crypto';
import User from "@/app/models/User";
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

export async function POST(req) {

    await dbConnect();
    const { email } = await req.json()
    if (!email) {
        throw new ApiError('Email is required', 400)
    }

    try {

        // Find user in db
        const user = await User.findOne({ email })
        if (!user) {
            throw new ApiError('User not found', 404)
        }

        // generate resetToken, Then hash it for safety and set token expiry and save to db
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const tokenExpire = Date.now() + 30 * 60 * 1000; // 30 mins

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = tokenExpire;
        await user.save();

        // define url which will be sent to user
        const resetURL = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

        // send email with reset password link
        await sendResetPasswordEmail(user.email, {
            name: user.name,
            resetURL,
        });

        // return response 
        return NextResponse.json({ success: true, message: 'Reset link sent to email' });
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Something went wrong while sending the reset password link : ", error, 500)
    }
}