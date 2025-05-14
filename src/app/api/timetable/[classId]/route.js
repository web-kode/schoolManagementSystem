import { dbConnect, ApiError, verifyToken, verifyAdminOrTeacher } from '../../../../utils/index.js';
import {Timetable} from '../../../../models/index.js';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        // 1️⃣ Auth check
        await verifyToken(req);
        await dbConnect();

        // 2️⃣ Get classId from params
        const { classId } = await params;
        if (!classId) {
            throw new ApiError('Class ID is required', 400);
        }

        // 3️⃣ Find timetable for the class
        const timetable = await Timetable.findOne({ classId }).populate({
            path: 'week.periods.teacher', // Populate teacher details
            select: '_id name email', // Only select necessary teacher fields
        });

        if (!timetable) {
            throw new ApiError('Timetable not found for this class', 404);
        }

        // 4️⃣ Return timetable
        return NextResponse.json({
            message: 'Timetable fetched successfully',
            data: timetable,
        }, { status: 200 })

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to fetch timetable', error, 500);
    }
}

export async function PATCH(req, { params }) {
    try {
        // 1️⃣ Auth checks
        await verifyToken(req);
        await verifyAdminOrTeacher(req);
        await dbConnect();

        // 2️⃣ Get classId from params and parse request body
        const { classId } = await params;
        const { week } = await req.json();

        if (!classId || !Array.isArray(week) || week.length === 0) {
            throw new ApiError('Class ID and week data are required', 400);
        }

        // 3️⃣ Find timetable for the class
        const existingTimetable = await Timetable.findOne({ classId });
        if (!existingTimetable) {
            throw new ApiError('Timetable not found for this class', 404);
        }

        // 4️⃣ Update timetable
        existingTimetable.week = week; // You can also update specific days or periods if needed
        await existingTimetable.save();

        // 5️⃣ Return success response
        return NextResponse.json({
            message: 'Timetable updated successfully',
            data: existingTimetable,
        }, { status: 200 })

    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to update timetable', error, 500);
    }
}

export async function DELETE(req, { params }) {
    try {
        // 1️⃣ Auth checks
        await verifyToken(req);
        await verifyAdminOrTeacher(req);
        await dbConnect();

        // 2️⃣ Get classId from params
        const { classId } = await params;
        if (!classId) {
            throw new ApiError('Class ID is required', 400);
        }

        // 3️⃣ Find and delete timetable
        const deletedTimetable = await Timetable.findOneAndDelete({ classId });
        if (!deletedTimetable) {
            throw new ApiError('Timetable not found for this class', 404);
        }

        // 4️⃣ Return success response
        return NextResponse.json({
            message: 'Timetable deleted successfully',
            data: deletedTimetable,
        }, { status: 200 })
    } catch (error) {
        if (error instanceof ApiError) throw error;
        throw new ApiError('Failed to delete timetable', error, 500);
    }
}