const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@tambua-africa.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Tambua Africa Admin";

if (!ADMIN_PASSWORD) {
  console.error("Missing ADMIN_PASSWORD in .env. Set it locally, then run: node update-admin.js (or update-admin.cjs)");
  console.error("Example: ADMIN_EMAIL=info@tambua-africa.com ADMIN_PASSWORD=… (do not commit .env)");
  process.exit(1);
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function updateAdminCredentials() {
  try {
    console.log(`Updating admin credentials for ${ADMIN_EMAIL}...`);

    const {
      data: { users },
      error: listError,
    } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    const existingUser = users.find(
      (user) => user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    );

    let adminUser = existingUser;

    if (existingUser) {
      const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: ADMIN_NAME,
        },
      });

      if (error) {
        throw error;
      }

      adminUser = data.user || existingUser;
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: ADMIN_NAME,
        },
      });

      if (error) {
        throw error;
      }

      adminUser = data.user;
    }

    if (!adminUser?.id) {
      throw new Error("Admin user could not be created or updated.");
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: adminUser.id,
      full_name: ADMIN_NAME,
      role: "admin",
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      throw profileError;
    }

    console.log(`Admin credentials updated successfully for ${ADMIN_EMAIL}.`);
  } catch (error) {
    console.error("Error updating admin credentials:", error);
    process.exitCode = 1;
  }
}

updateAdminCredentials();
