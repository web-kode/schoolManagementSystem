import { ApiError } from './';

export const verifyAdminOrTeacher = (req) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'teacher') {
    throw new ApiError('Forbidden: Admins and Teachers only', 403);
  }
  return req;
};