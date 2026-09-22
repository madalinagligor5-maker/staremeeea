import "server-only";
import { createClient } from "@/lib/supabase/server";
import { fallbackResources, type EditorialResource } from "@/lib/editorial-content";

export async function getPublicResources(): Promise<EditorialResource[]> {
  const supabase = await createClient();
  if (!supabase) return fallbackResources;
  const { data, error } = await supabase.from("resources").select("id,title,slug,excerpt,body,resource_type,access,is_published,published_at").eq("is_published", true).order("published_at", { ascending: false });
  if (error || !data?.length) return fallbackResources;
  return data.map((item) => ({ ...item, excerpt: item.excerpt ?? "", body: item.body ?? "", published_at: item.published_at ?? new Date().toISOString() })) as EditorialResource[];
}

export async function getPublicResource(slug: string): Promise<EditorialResource | null> {
  const resources = await getPublicResources();
  return resources.find((item) => item.slug === slug) ?? null;
}
