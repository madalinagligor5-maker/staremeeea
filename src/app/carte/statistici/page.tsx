import type { Metadata } from "next";
import { StatsView } from "@/components/carte/stats-view";

export const metadata: Metadata = { title: "Statistici" };

export default function StatisticiPage() {
  return <StatsView />;
}
