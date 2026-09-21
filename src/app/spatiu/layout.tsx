import { AppShell } from "@/components/app-shell";
export default function SpaceLayout({ children }: { children: React.ReactNode }) { return <AppShell demo={!process.env.NEXT_PUBLIC_SUPABASE_URL}>{children}</AppShell>; }
