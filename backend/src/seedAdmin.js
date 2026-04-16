import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/admin.model.js";

dotenv.config({ quiet: true });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error(err));

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@bbms.local";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "bbms@admin";
    const adminName = process.env.SEED_ADMIN_NAME || "System Admin";

    // Remove existing admin with same email
    await Admin.deleteMany({ email: adminEmail });

    // Create new admin
    const admin = new Admin({
      name: adminName,
      email: adminEmail,
      password: adminPassword, // will be hashed automatically
      role: "admin",
    });

    await admin.save();
    console.log("Admin seeded successfully ✅");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();