import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.VERIFYINDIC_ADMIN_PASSWORD;

if (!url || !serviceRoleKey || !password) {
  console.error("Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and VERIFYINDIC_ADMIN_PASSWORD before running this script.");
  process.exit(1);
}
if (password.length < 6) {
  console.error("The temporary password must contain at least 6 characters.");
  process.exit(1);
}

const admins = [
  ["Sakshi Raghuwanshi", "sakshiraghuwanshi0309@gmail.com"],
  ["Saksham Agarwal", "agarwalsaksham099@gmail.com"],
  ["Vallabh Madje", "vallabhmadje22@gamil.com"],
  ["Raj Kose", "rajkose.94@gmail.com"],
];

const client = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
const { data: userPage, error: userError } = await client.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (userError) throw userError;
const existingUsers = new Map(userPage.users.map((user) => [user.email?.toLowerCase(), user]));

for (const [fullName, email] of admins) {
  const existing = existingUsers.get(email);
  if (existing) {
    const { error } = await client.auth.admin.updateUserById(existing.id, {
      user_metadata: { ...existing.user_metadata, display_name: fullName, verifyindic_registration: true },
    });
    if (error) throw error;
    console.log(`Verified admin profile for ${email}`);
    continue;
  }

  const { error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: fullName, verifyindic_registration: true },
  });
  if (error) throw error;
  console.log(`Created admin account for ${email}`);
}

console.log("Admin provisioning complete. Have every administrator change the temporary password after first sign-in.");
