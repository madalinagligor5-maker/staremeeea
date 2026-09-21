"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const tableSchema = z.enum(["resources", "calm_exercises", "journal_prompts", "testimonials"]);
const idSchema = z.string().uuid();

async function getAdminDatabase() {
  const supabase = await createClient();
  if (!supabase) redirect("/autentificare");
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/autentificare?next=/admin");
  if (data.user.app_metadata?.role !== "admin") throw new Error("Nu ai permisiunea de a modifica acest conținut.");
  return createAdminClient();
}

function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90);
}

function readString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export async function createResource(formData: FormData) {
  const input = z.object({
    title: z.string().min(3).max(160), excerpt: z.string().max(320),
    resource_type: z.enum(["article", "guide", "workbook", "audio", "program"]), access: z.enum(["free", "plus"]),
  }).parse({ title: readString(formData, "title"), excerpt: readString(formData, "excerpt"), resource_type: readString(formData, "resource_type"), access: readString(formData, "access") });
  const db = await getAdminDatabase();
  const { error } = await db.from("resources").insert({ ...input, slug: `${slugify(input.title)}-${crypto.randomUUID().slice(0, 6)}`, is_published: false });
  if (error) throw new Error("Resursa nu a putut fi salvată.");
  revalidatePath("/admin");
}

export async function createCalmExercise(formData: FormData) {
  const input = z.object({
    title: z.string().min(3).max(140), category: z.string().min(2).max(100), body: z.string().min(10).max(4000),
    minutes: z.coerce.number().int().refine((value) => [1, 3, 5, 10].includes(value)), access: z.enum(["free", "plus"]),
  }).parse({ title: readString(formData, "title"), category: readString(formData, "category"), body: readString(formData, "body"), minutes: readString(formData, "minutes"), access: readString(formData, "access") });
  const db = await getAdminDatabase();
  const { error } = await db.from("calm_exercises").insert({ ...input, slug: `${slugify(input.title)}-${crypto.randomUUID().slice(0, 6)}`, is_published: false });
  if (error) throw new Error("Exercițiul nu a putut fi salvat.");
  revalidatePath("/admin");
}

export async function createJournalPrompt(formData: FormData) {
  const input = z.object({ prompt: z.string().min(5).max(300), sort_order: z.coerce.number().int().min(0).max(999) }).parse({ prompt: readString(formData, "prompt"), sort_order: readString(formData, "sort_order") });
  const db = await getAdminDatabase();
  const { error } = await db.from("journal_prompts").insert({ ...input, is_published: false });
  if (error) throw new Error("Promptul nu a putut fi salvat.");
  revalidatePath("/admin");
}

export async function createTestimonial(formData: FormData) {
  const input = z.object({ display_name: z.string().min(2).max(100), quote: z.string().min(10).max(1000) }).parse({ display_name: readString(formData, "display_name"), quote: readString(formData, "quote") });
  const db = await getAdminDatabase();
  const { error } = await db.from("testimonials").insert({ ...input, is_verified: formData.get("is_verified") === "true", is_published: false });
  if (error) throw new Error("Testimonialul nu a putut fi salvat.");
  revalidatePath("/admin");
}

export async function toggleAdminItem(formData: FormData) {
  const table = tableSchema.parse(readString(formData, "table"));
  const id = idSchema.parse(readString(formData, "id"));
  const published = readString(formData, "published") === "true";
  const db = await getAdminDatabase();
  if (table === "testimonials" && published) {
    const { data } = await db.from("testimonials").select("is_verified").eq("id", id).single();
    if (!data?.is_verified) throw new Error("Confirmă acordul persoanei înainte de publicare.");
  }
  const values: { is_published: boolean; published_at?: string | null; updated_at?: string } = { is_published: published };
  if (table === "resources") values.published_at = published ? new Date().toISOString() : null;
  if (table === "resources" || table === "calm_exercises") values.updated_at = new Date().toISOString();
  const { error } = await db.from(table).update(values).eq("id", id);
  if (error) throw new Error("Starea de publicare nu a putut fi schimbată.");
  revalidatePath("/admin");
  revalidatePath("/resurse");
  revalidatePath("/spatiu");
}

export async function deleteAdminItem(formData: FormData) {
  const table = tableSchema.parse(readString(formData, "table"));
  const id = idSchema.parse(readString(formData, "id"));
  const db = await getAdminDatabase();
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) throw new Error("Elementul nu a putut fi șters.");
  revalidatePath("/admin");
}
