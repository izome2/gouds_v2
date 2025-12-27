import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const userInfo = await getToken({
    req: request,
    // NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  });

  // console.log(
  //   "middleware ran>>>>]]]",
  //   request.nextUrl.pathname,
  //   "userInfo",
  //   userInfo?.email
  // );

  const { pathname } = request.nextUrl;

  // Allow guest checkout - don't require authentication for checkout page
  if (pathname.startsWith('/checkout')) {
    return NextResponse.next();
  }

  // For all other protected routes, require authentication
  if (!userInfo) {
    return NextResponse.redirect(new URL(`/auth/login`, request.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/user/:path*",
    "/order/:path*",
    "/checkout/:path*", // Keep this here but handle it differently in middleware
    // "/auth/login/:path*",
  ],
};