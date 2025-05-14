import mongoose from 'mongoose';
import { dbConnect, ApiError, verifyToken, verifyAdminOrTeacher } from '../../../utils/index.js';
import {Timetable} from "../../../models/index.js"
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    // 1️⃣ Auth checks
    await verifyToken(req);
    await verifyAdminOrTeacher(req);
    await dbConnect();

    // 2️⃣ Parse the request body
    const { classId, week } = await req.json();
    if (!classId || !Array.isArray(week) || week.length === 0) {
      throw new ApiError('Class ID and week data are required', 400);
    }

    // 3️⃣ Check if timetable for the class already exists
    const existingTimetable = await Timetable.findOne({ classId });
    if (existingTimetable) {
      throw new ApiError('Timetable already exists for this class', 400);
    }

    // 4️⃣ Create and save new timetable
    const newTimetable = new Timetable({ classId, week });
    await newTimetable.save();

    // 5️⃣ Return success response
    return NextResponse.json({
        message: 'Timetable created successfully',
        data: newTimetable,
    },{ status: 200 })

  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to create timetable', error, 500);
  }
}
