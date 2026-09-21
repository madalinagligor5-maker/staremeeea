-- Grants and RLS are separate security layers in current Supabase projects.
revoke all on all tables in schema public from anon, authenticated;

grant select, insert, update, delete on table
  public.profiles, public.user_preferences, public.wellbeing_consents,
  public.daily_checkins, public.tasks, public.task_steps,
  public.brain_dump_items, public.focus_sessions, public.journal_entries,
  public.calm_sessions, public.program_progress
to authenticated;

grant select on table public.subscriptions, public.purchases, public.entitlements to authenticated;
grant select on table
  public.calm_exercises, public.resource_categories, public.resources,
  public.programs, public.program_modules, public.testimonials, public.site_content
to anon, authenticated;
grant select on table public.templates, public.template_steps, public.journal_prompts to authenticated;
grant insert on table public.newsletter_subscribers to anon, authenticated;
grant insert, update, delete on table
  public.calm_exercises, public.resource_categories, public.resources,
  public.programs, public.program_modules, public.templates,
  public.template_steps, public.testimonials, public.site_content, public.journal_prompts
to authenticated;
