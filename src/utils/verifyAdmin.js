import { ApiError } from './index.js';

export const verifyAdmin = (req) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError('Forbidden: Admins only', 403);
  }
  return req;
};