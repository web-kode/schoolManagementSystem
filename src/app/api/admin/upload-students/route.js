import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { verifyAdmin, verifyToken, dbConnect, ApiError, sendLoginEmail } from "@/app/utils"
import User from '@/app/models/User';

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req) {
    try {
        // 1️⃣ Auth checks
        await verifyToken(req);
        await verifyAdmin(req);

        // 2️⃣ Parse the multipart/form-data
        const form = await req.formData();
        const file = form.get('file');
        if (!(file instanceof File)) {
            throw new ApiError('No file uploaded under key "file"', 400);
        }

        // 3️⃣ Read it into a Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4️⃣ Parse Excel → JSON
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        // 5️⃣ Validate Data
        const requiredFields = ['name', 'email', 'rollNumber', 'class', 'section'];
        const invalidRows = [];
        const fileEmailSet = new Set();
        const fileDuplicates = [];

        rows.forEach((row, idx) => {
            const missing = requiredFields.filter(f => !row[f]);
            const isInvalidEmail = !/^\S+@\S+\.\S+$/.test(row.email);
            if (missing.length > 0 || isInvalidEmail) {
                invalidRows.push({ row: idx + 2, missingFields: missing, invalidEmail: row.email });
            }
            if (fileEmailSet.has(row.email)) {
                fileDuplicates.push({ row: idx + 2, email: row.email });
            }
            fileEmailSet.add(row.email);
        });

        await dbConnect();

        const studentIds = rows.map(r => `${r.rollNumber}${r.class}${r.section}`.toLowerCase());
        const existingEmails = await User.find({ email: { $in: rows.map(r => r.email) } }, 'email');
        const existingStudentIds = await User.find({ studentId: { $in: studentIds } }, 'studentId');

        const existingEmailSet = new Set(existingEmails.map(u => u.email));
        const existingIdSet = new Set(existingStudentIds.map(u => u.studentId));

        // 🔶 6️⃣ Return if validation fails
        if (invalidRows.length || fileDuplicates.length || existingEmailSet.size || existingIdSet.size) {
            return NextResponse.json({
                status: 'error',
                message: 'Validation failed',
                issues: {
                    invalidRows,
                    fileDuplicates,
                    existingEmails: Array.from(existingEmailSet),
                    existingStudentIds: Array.from(existingIdSet),
                },
            }, { status: 400 });
        }

        // 7️⃣ Prepare Valid Data for Insertion
        const studentsData = await Promise.all(
            rows.map(async row => {
                const randomPassword = uuidv4().slice(0, 8);
                const hashedPassword = await bcrypt.hash(randomPassword, 10);

                const studentId = `${row.rollNumber}${row.class}${row.section}`.toLowerCase(); // lowercase for consistency

                try {
                    await sendLoginEmail(row.email, {
                        name: row.name,
                        email: row.email,
                        password: randomPassword,
                    });
                } catch (error) {
                    console.log("Failed to send email : ", error);

                }

                return {
                    ...row,
                    password: hashedPassword,
                    role: 'student',
                    studentId, // 👈 add this
                };
            })
        );
        const students = await User.insertMany(studentsData);

        // 8️⃣ Success response
        return NextResponse.json({
            status: 'success',
            message: `${students.length} students added successfully`,
            data: students.map(s => ({
                name: s.name,
                email: s.email,
                studentId: s.studentId,
                classId: s.classId,
            })),
        }, { status: 200 });
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError("Something went wrong while adding bulk students : ", error, 500)
    }
}
