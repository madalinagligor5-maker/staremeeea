import { getAccess } from "@/lib/access";

// Starea abonamentului pentru utilizatorul conectat. Nu returnează nimic despre ce a scris (acel conținut nu ajunge pe server).
export async function GET() {
  const access = await getAccess();
  if (!access) return Response.json({ configured: false }, { status: 503 });
  return Response.json({ configured: true, ...access }, { headers: { "cache-control": "no-store" } });
}
