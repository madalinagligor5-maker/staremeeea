import type { Metadata } from "next";
import { BackupView } from "@/components/carte/backup-view";

export const metadata: Metadata = { title: "Datele tale" };

export default function DatePage() {
  return <BackupView />;
}
