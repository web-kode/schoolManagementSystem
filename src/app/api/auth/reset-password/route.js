import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { dbConnect, ApiError } from '@/app/utils';
import User from '@/app/models/User';

export async function POST(req) {
    try {
        await dbConnect();

        // get token and password from request body
        const { token, password } = await req.json();
        if (!token || !password) {
            throw new ApiError("Token and password are required", 400);
        }

        // create hash again so we can match both hashed token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // find user in db using hashed token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            throw new ApiError('Token is invalid or expired', 400);
        }

        // save hashed password to user document, and clear token fields
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // return response
        return NextResponse.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Something went wrong while reseting the password : ", error, 500)
    }
}