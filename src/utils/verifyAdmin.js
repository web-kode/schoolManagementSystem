import { ApiError } from './';

export const verifyAdmin = (req) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError('Forbidden: Admins only', 403);
  }
  return req;
};