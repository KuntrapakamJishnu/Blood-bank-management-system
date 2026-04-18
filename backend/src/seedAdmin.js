import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/admin.model.js";

dotenv.config({ quiet: true });

export const ensureSeedAdmin = async () => {
  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@bbms.local";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "bbms@admin";
    const adminName = process.env.SEED_ADMIN_NAME || "System Admin";

    const normalizedEmail = adminEmail.toLowerCase().trim();
    let admin = await Admin.findOne({ email: normalizedEmail }).select("+password");

    if (!admin) {
      admin = new Admin({
        name: adminName,
        email: normalizedEmail,
        password: adminPassword,
        role: "admin",
        isActive: true,
      });
      await admin.save();
      console.log("Seed admin created ✅");
      return;
    }

    admin.name = adminName;
    admin.password = adminPassword;
    admin.role = "admin";
    admin.isActive = true;
    await admin.save();
    console.log("Seed admin updated ✅");
  } catch (error) {
    console.error("Seed admin failed:", error.message);
    throw error;
  }
};

const runSeedScript = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");
    await ensureSeedAdmin();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

if (process.argv[1] && process.argv[1].includes("seedAdmin.js")) {
  runSeedScript();
}