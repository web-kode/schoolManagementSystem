import jwt from 'jsonwebtoken';
import ApiError from './ApiError';

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Destructure with explicit fallback values
const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRATION,
  JWT_REFRESH_EXPIRATION
} = process.env;
// console.log(JWT_SECRET);
// console.log(JWT_REFRESH_SECRET);
// console.log(JWT_ACCESS_EXPIRATION);
// console.log(JWT_REFRESH_EXPIRATION);


// Ensure that if any of these is falsy, we use a default.
const accessExp = JWT_ACCESS_EXPIRATION || '15m';
const refreshExp = JWT_REFRESH_EXPIRATION || '7d';

/**
 * Generate Access Token
 * @param {Object} user - The user object (usually includes id, role)
 * @returns {string} - Signed JWT access token
 */
const generateAccessToken = (user) => {
    try {
        return jwt.sign(
            { id: user._id, role: user.role }, // Payload
            JWT_SECRET,                         // Secret key for the access token
            { expiresIn: accessExp } // Expiration time for the access token
        );
    } catch (error) {
        throw new ApiError(500, 'Error generating access token');
    }
};

/**
 * Generate Refresh Token
 * @param {Object} user - The user object (usually includes id, role)
 * @returns {string} - Signed JWT refresh token
 */
const generateRefreshToken = (user) => {
    try {
        return jwt.sign(
            { id: user._id, role: user.role }, // Payload
            JWT_REFRESH_SECRET,                 // Secret key for the refresh token
            { expiresIn: refreshExp } // Expiration time for the refresh token
        );
    } catch (error) {
        throw new ApiError(500, 'Error generating refresh token');
    }
};

/**
 * Verify Access Token
 * @param {string} token - The JWT access token to be verified
 * @returns {Object} - Decoded user info if the token is valid
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new ApiError(401, 'Invalid or expired access token');
    }
};

/**
 * Verify Refresh Token
 * @param {string} token - The JWT refresh token to be verified
 * @returns {Object} - Decoded user info if the token is valid
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }
};

/**
 * Refresh Access Token using Refresh Token
 * @param {string} refreshToken - The JWT refresh token to be used for generating a new access token
 * @returns {string} - New access token
 */
const refreshAccessToken = (refreshToken) => {
    try {
        // Verify refresh token and get the decoded user info
        const decoded = verifyRefreshToken(refreshToken);

        // Generate a new access token for the user
        return generateAccessToken(decoded);
    } catch (error) {
        throw new ApiError(401, 'Unable to refresh access token');
    }
};

export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    refreshAccessToken
};
