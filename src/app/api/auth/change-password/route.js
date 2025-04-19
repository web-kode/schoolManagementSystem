import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyToken, dbConnect, ApiError } from '@/app/utils';
import User from '@/app/models/User';

export async function POST(req) {
    try {
        await verifyToken(req);
        await dbConnect();

        // get current and new password from req
        const { currentPassword, newPassword } = await req.json();
        if (!currentPassword || !newPassword) {
            throw new ApiError("Current password and new password are required", 400);
        }

        // Get user ID from token and find user in db
        const userId = req.user.id;
        const user = await User.findById(userId).select('+password');
        if (!user) {
            throw new ApiError('User not found', 404);
        }

        // check if current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new ApiError('Current password is incorrect', 400);
        }

        // update password and save user
        user.password = newPassword
        await user.save();

        // return response
        return NextResponse.json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Something went wrong while changing the password : ", error, 500)
    }
}