"use server";

import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function adminSignOut(form: FormData) {
  const locale = String(form.get("locale") ?? "ko");
  const client = await createClient();
  await client?.auth.signOut();
  redirect({ href: "/", locale });
}
