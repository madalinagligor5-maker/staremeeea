import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(){const supabase=await createClient();if(!supabase)return Response.json({error:"Neconfigurat"},{status:503});const {data}=await supabase.auth.getUser();if(!data.user)return Response.json({error:"Neautorizat"},{status:401});await supabase.auth.signOut();const {error}=await createAdminClient().auth.admin.deleteUser(data.user.id);if(error)return Response.json({error:"Contul nu a putut fi șters."},{status:500});return Response.json({deleted:true})}
