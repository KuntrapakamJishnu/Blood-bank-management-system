import "dotenv/config";
import mongoose from "mongoose";
import SmokeUser from "../src/models/smoke-user.model.js";

const templates = [
  {
    key: "donor-register",
    description: "Reusable donor registration fixture",
    payload: {
      role: "donor",
      fullName: "Smoke Donor",
      emailPrefix: "test.donor",
      emailDomain: "example.com",
      password: "Password@123",
      phonePrefix: "9876543",
      phoneSeed: 101,
      emergencySeed: 102,
      age: 25,
      gender: "Male",
      bloodGroup: "O+",
      weight: 65,
      address: {
        street: "123 Test St",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
      },
    },
  },
  {
    key: "facility-register",
    description: "Reusable hospital registration fixture",
    payload: {
      role: "hospital",
      facilityType: "hospital",
      namePrefix: "Smoke General Hospital",
      emailPrefix: "test.hospital",
      emailDomain: "example.com",
      password: "Password@123",
      phonePrefix: "9876543",
      phoneSeed: 201,
      emergencySeed: 202,
      registrationPrefix: "SGH",
      address: {
        street: "456 Test Ave",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500002",
      },
      documents: {
        registrationProof: {
          url: "https://example.com/proof.pdf",
          filename: "proof.pdf",
        },
      },
    },
  },
  {
    key: "lab-register",
    description: "Reusable blood lab registration fixture",
    payload: {
      role: "blood-lab",
      facilityType: "blood-lab",
      name: "Smoke Lab",
      emailPrefix: "test.lab",
      emailDomain: "example.com",
      password: "Password@123",
      phonePrefix: "9876543",
      phoneSeed: 221,
      emergencySeed: 222,
      registrationPrefix: "LAB",
      address: {
        street: "1 Lab Street",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500003",
      },
      documents: {
        registrationProof: {
          url: "https://example.com/lab-proof.pdf",
          filename: "lab-proof.pdf",
        },
      },
    },
  },
  {
    key: "sms-register",
    description: "Reusable email+SMS registration fixture",
    payload: {
      emailPrefix: "sms",
      emailDomain: "example.com",
      phonePrefix: "9876543",
      phoneSeed: 301,
    },
  },
];

if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is required to seed smoke users");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);

for (const template of templates) {
  await SmokeUser.findOneAndUpdate(
    { key: template.key },
    {
      key: template.key,
      description: template.description,
      payload: template.payload,
    },
    { upsert: true, returnDocument: "after" }
  );
}

console.log(`Seeded ${templates.length} smoke user templates.`);
await mongoose.disconnect();