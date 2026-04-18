import nodemailer from "nodemailer";
import twilio from "twilio";
import { Resend } from "resend";

let mailTransporter;
let twilioClient;
let resendClient;

const getEmailTransporter = () => {
  if (mailTransporter) return mailTransporter;

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }

  mailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return mailTransporter;
};

const getTwilioClient = () => {
  if (twilioClient) return twilioClient;

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    return null;
  }

  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return twilioClient;
};

const getResendClient = () => {
  if (resendClient) return resendClient;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  resendClient = new Resend(apiKey);
  return resendClient;
};

const getOtpFromEmail = () => {
  return (
    process.env.RESEND_FROM_EMAIL ||
    process.env.OTP_FROM_EMAIL ||
    process.env.SMTP_USER ||
    ""
  );
};

const formatPhoneNumber = (phone) => {
  const raw = `${phone || ""}`.trim();
  if (!raw) return "";

  if (raw.startsWith("+")) return raw;
  if (/^[0-9]{10}$/.test(raw)) return `+91${raw}`;
  if (/^[0-9]{12}$/.test(raw) && raw.startsWith("91")) return `+${raw}`;
  return raw;
};

export const normalizePhoneNumber = (phone) => formatPhoneNumber(phone);

export const sendOtpEmail = async ({ email, code, purpose = "register" }) => {
  const resend = getResendClient();
  const transporter = getEmailTransporter();
  const fromEmail = getOtpFromEmail();

  if ((!transporter && !resend) || !fromEmail) {
    return {
      channel: "email",
      delivered: false,
      reason: "Email provider not configured (set RESEND_API_KEY and RESEND_FROM_EMAIL, or SMTP settings)",
    };
  }

  const subject = purpose === "register" ? "Your registration OTP" : "Your OTP code";
  const text = `Your OTP is ${code}. It expires in 10 minutes.`;

  try {
    // Prefer Resend when configured; use SMTP as fallback.
    if (resend) {
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject,
        text,
        html: `<p>Your OTP is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
      });

      return { channel: "email", delivered: true, provider: "resend" };
    }

    if (transporter) {
      await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject,
        text,
        html: `<p>Your OTP is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
      });

      return { channel: "email", delivered: true, provider: "smtp" };
    } else {
      return {
        channel: "email",
        delivered: false,
        reason: "No email provider available",
      };
    }
  } catch (error) {
    return {
      channel: "email",
      delivered: false,
      reason: error?.message || "Email delivery failed",
    };
  }
};

export const sendOtpSms = async ({ phone, code, purpose = "register" }) => {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const to = formatPhoneNumber(phone);

  if (!client) {
    return {
      channel: "sms",
      delivered: false,
      reason: "SMS provider not configured",
    };
  }

  if (verifyServiceSid) {
    try {
      const verification = await client.verify.v2
        .services(verifyServiceSid)
        .verifications.create({ to, channel: "sms" });

      return {
        channel: "sms",
        delivered: verification.status === "pending",
        provider: "twilio-verify",
      };
    } catch (error) {
      return {
        channel: "sms",
        delivered: false,
        reason: error?.message || "SMS delivery failed",
      };
    }
  }

  if (!fromNumber) {
    return {
      channel: "sms",
      delivered: false,
      reason: "TWILIO_FROM_NUMBER missing for programmable SMS",
    };
  }

  const message =
    purpose === "register"
      ? `Your Blood Bank registration OTP is ${code}. Valid for 10 minutes.`
      : `Your OTP is ${code}. Valid for 10 minutes.`;

  try {
    await client.messages.create({
      body: message,
      from: fromNumber,
      to,
    });

    return { channel: "sms", delivered: true };
  } catch (error) {
    return {
      channel: "sms",
      delivered: false,
      reason: error?.message || "SMS delivery failed",
    };
  }
};

export const deliverOtp = async ({ email, phone, code, purpose, channel = "both" }) => {
  const requestedChannels =
    channel === "both" ? ["email", "sms"] : [channel];

  const results = [];

  if (requestedChannels.includes("email") && email) {
    results.push(await sendOtpEmail({ email, code, purpose }));
  }

  if (requestedChannels.includes("sms") && phone) {
    results.push(await sendOtpSms({ phone, code, purpose }));
  }

  if (!results.length) {
    return {
      delivered: false,
      channels: [],
      results: [
        {
          channel,
          delivered: false,
          reason: "No valid contact details provided",
        },
      ],
    };
  }

  return {
    delivered: results.some((item) => item.delivered),
    channels: results.filter((item) => item.delivered).map((item) => item.channel),
    results,
  };
};

export const getOtpProviderStatus = () => {
  const resendConfigured = Boolean(process.env.RESEND_API_KEY && getOtpFromEmail());
  const smtpConfigured = Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
  const twilioClientConfigured = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  const twilioVerifyConfigured = Boolean(process.env.TWILIO_VERIFY_SERVICE_SID);
  const twilioProgrammableConfigured = Boolean(process.env.TWILIO_FROM_NUMBER);

  return {
    email: {
      resendConfigured,
      smtpConfigured,
      fromEmail: Boolean(getOtpFromEmail()),
      providerPriority: ["resend", "smtp"],
    },
    sms: {
      twilioClientConfigured,
      twilioVerifyConfigured,
      twilioProgrammableConfigured,
    },
  };
};

export const verifySmsOtp = async ({ phone, code }) => {
  const client = getTwilioClient();
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const to = formatPhoneNumber(phone);

  if (!client || !verifyServiceSid) {
    return {
      verified: false,
      reason: "Twilio Verify is not configured",
    };
  }

  try {
    const check = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to, code });

    if (check.status !== "approved") {
      return {
        verified: false,
        reason: "Invalid OTP code",
      };
    }

    return { verified: true };
  } catch (error) {
    return {
      verified: false,
      reason: error?.message || "Unable to verify SMS OTP",
    };
  }
};
