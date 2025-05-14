import jwt from "jsonwebtoken";
import { ApiError } from "./index.js";
import dotenv from "dotenv"
dotenv.config({ path: '.env' });

import { cookies } from 'next/headers';


export const verifyToken = async (req) => {
  try {
    // const accessToken = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    // console.log(("Access Token : ", accessToken));

    if (!accessToken) {
      throw new ApiError("Unauthorized: No token provided", 401);
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user to request

    return req;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Unauthorized: Invalid or expired token : Error :: ", error, 401);
  }
};