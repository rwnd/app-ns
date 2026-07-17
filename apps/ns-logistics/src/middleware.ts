import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isHello = req.nextUrl.pathname.startsWith("/hello");

  if (isHello && !isLoggedIn) {
    const loginUrl = new URL("/", req.nextUrl.origin);
    loginUrl.searchParams.set("error", "SessionRequired");
    return NextResponse.redirect(loginUrl);
  }

  if (req.nextUrl.pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/hello", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/", "/hello"],
};
