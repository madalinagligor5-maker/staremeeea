import { NextResponse, type NextRequest } from "next/server";
import { isHiddenUntilLaunch } from "@/lib/launch";
import { refreshSession } from "@/lib/supabase/proxy";
export async function proxy(request: NextRequest) {
  // Rutele ascunse în modul curent de lansare trimit către prima pagină.
  if (isHiddenUntilLaunch(request.nextUrl.pathname)) return NextResponse.redirect(new URL("/", request.url));
  return refreshSession(request);
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
