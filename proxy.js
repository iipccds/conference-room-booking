// middleware.js

import { NextResponse } from "next/server";

// Define which paths are protected for admins
const ADMIN_PATHS = ["/users", "/requests", "/rooms/add", "/rooms/my"];

export async function proxy(request) {
  // 1. Check for the session cookie. This is a fast and cheap operation.
  const session = request.cookies.get("appwrite-session")?.value;

  // If no session, redirect to login for any protected route.
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const pathname = request.nextUrl.pathname;

  // 2. If the user is accessing an admin path, verify their role.
  if (ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    // This fetch call asks our own backend (which can use the Node SDK)
    // to verify the session and return the user's role.
    const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/me`, {
      headers: {
        // Pass the cookie to the API route
        cookie: `appwrite-session=${session}`,
      },
    });

    // If the API route returns an error (e.g., invalid session), redirect to login
    if (!response.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { role } = await response.json();

    // If the role is not admin, deny access by redirecting to the homepage.
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // 3. If all checks pass, allow the request to continue.
  return NextResponse.next();
}

// Configuration to specify which routes this middleware applies to.
// The new matcher is more scalable.
export const config = {
  matcher: [
    "/bookings/:path*",
    "/rooms/:path*",
    "/users/:path*",
    "/requests/:path*",
  ],
};
