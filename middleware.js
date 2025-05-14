import { NextResponse } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/admin/login', '/student/login', '/teacher/login' ,'/forgot-password'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isPublicRoute = publicRoutes.includes(pathname);

  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/student/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Prevent logged-in users from accessing login/register pages
  if (token && isPublicRoute) {
    const dashboardUrl = new URL('/', request.url); // Change '/' to your dashboard/home page
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}
