import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(2, "Street is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Valid 6-digit pincode is required"),
});

const donorRegisterSchema = z
  .object({
    role: z.literal("donor"),
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().min(2, "Full name is required"),
    phone: z.string().regex(/^[6-9][0-9]{9}$/, "Valid 10-digit phone number is required"),
    bloodGroup: z.enum(["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]),
    age: z.number().int().min(18, "Must be at least 18 years old").max(65, "Age limit is 65 years"),
    gender: z.enum(["Male", "Female", "Other"]),
    address: addressSchema,
  })
  .passthrough();

const facilityRegisterSchema = z
  .object({
    role: z.enum(["hospital", "blood-lab"]),
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().min(2, "Facility name is required").optional(),
    fullName: z.string().min(2, "Facility name is required").optional(),
    phone: z.string().regex(/^[6-9][0-9]{9}$/, "Valid 10-digit phone number is required"),
    emergencyContact: z.string().regex(/^[6-9][0-9]{9}$/, "Valid 10-digit emergency contact is required"),
    registrationNumber: z.string().min(3, "Registration number is required"),
    facilityType: z.enum(["hospital", "blood-lab"]).optional(),
    address: addressSchema,
    documents: z.object({
      registrationProof: z.object({
        url: z.string().url("Valid registration proof URL is required"),
        filename: z.string().optional(),
      }),
    }),
  })
  .refine((data) => Boolean(data.name || data.fullName), {
    message: "Facility name is required",
    path: ["name"],
  })
  .passthrough();

export const registerSchema = z
  .discriminatedUnion("role", [donorRegisterSchema, facilityRegisterSchema])
  .refine((data) => {
    if (data.role === "hospital" || data.role === "blood-lab") {
      return !data.facilityType || data.facilityType === data.role;
    }
    return true;
  }, {
    message: "facilityType must match role",
    path: ["facilityType"],
  });

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const otpRequestSchema = z.object({
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .regex(/^(\+91|91)?[6-9][0-9]{9}$/, "Valid phone number is required")
    .optional(),
  channel: z.enum(["email", "sms", "both"]).default("both"),
  purpose: z.enum(["register"]).default("register"),
}).superRefine((value, ctx) => {
  if ((value.channel === "sms" || value.channel === "both") && !value.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Phone is required when channel is sms or both",
      path: ["phone"],
    });
  }
});

export const otpVerifySchema = z.object({
  email: z.string().email("Valid email is required"),
  phone: z
    .string()
    .regex(/^(\+91|91)?[6-9][0-9]{9}$/, "Valid phone number is required")
    .optional(),
  channel: z.enum(["email", "sms"]).default("email"),
  code: z.string().regex(/^[0-9]{6}$/, "OTP must be a 6-digit code"),
  purpose: z.enum(["register"]).default("register"),
}).superRefine((value, ctx) => {
  if (value.channel === "sms" && !value.phone) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Phone is required when channel is sms",
      path: ["phone"],
    });
  }
});

export const otpStatusSchema = z.object({
  email: z.string().email("Valid email is required"),
  purpose: z.enum(["register"]).default("register"),
});
