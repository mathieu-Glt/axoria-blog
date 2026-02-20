import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function middleware(req) {
  //console.log(" MIDDLEWARE - req : ", req);
  const authCheckUrl = new URL("/api/auth/validateSession", req.url);

  const authResponse = await fetch(authCheckUrl, {
    headers: {
      cookie: (await cookies()).toString(),
    },
    cache: "no-store",
    next: { tags: ["auth-session"] },
  });

  const { authorized } = await authResponse.json();

  if (!authorized) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path((?!.*\\..*).*)*"],
};
