import { NextResponse, type NextRequest } from "next/server";
import { isHiddenUntilLaunch, preLaunch } from "@/lib/launch";
import { refreshSession } from "@/lib/supabase/proxy";
export async function proxy(request: NextRequest) {
  // Până la lansare, instrumentele sunt ascunse: trimitem totul către pagina de lansare.
  if (preLaunch && isHiddenUntilLaunch(request.nextUrl.pathname)) return NextResponse.redirect(new URL("/", request.url));
  return refreshSession(request);
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"] };
