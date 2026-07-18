import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isHome = path.startsWith("/home");
  const isHello = path.startsWith("/hello");

  if ((isHome || isHello) && !isLoggedIn) {
    const loginUrl = new URL("/", req.nextUrl.origin);
    loginUrl.searchParams.set("error", "SessionRequired");
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && (path === "/" || isHello)) {
    return NextResponse.redirect(new URL("/home", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/home", "/hello"],
};
