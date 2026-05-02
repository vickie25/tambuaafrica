const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const ADMIN_EMAIL = "inf@tambuaafrica.com";
const ADMIN_PASSWORD = "Isaacmarenya@2002/#";
const ADMIN_NAME = "Tambua Africa Admin";

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
