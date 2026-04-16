import nodemailer from "nodemailer";
import twilio from "twilio";

let mailTransporter;
let twilioClient;

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

const formatPhoneNumber = (phone) => {
  const raw = `${phone || ""}`.trim();
  if (!raw) return "";

  if (raw.startsWith("+")) return raw;
  if (/^[0-9]{10}$/.test(raw)) return `+91${raw}`;
  if (/^[0-9]{12}$/.test(raw) && raw.startsWith("91")) return `+${raw}`;
  return raw;
};

export const sendOtpEmail = async ({ email, code, purpose = "register" }) => {
  const transporter = getEmailTransporter();
  const fromEmail = process.env.OTP_FROM_EMAIL;

  if (!transporter || !fromEmail) {
    return {
      channel: "email",
      delivered: false,
      reason: "Email provider not configured",
    };
  }

  const subject = purpose === "register" ? "Your registration OTP" : "Your OTP code";
  const text = `Your OTP is ${code}. It expires in 10 minutes.`;

  await transporter.sendMail({
    from: fromEmail,
    to: email,
    subject,
    text,
    html: `<p>Your OTP is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`,
  });

  return { channel: "email", delivered: true };
};

export const sendOtpSms = async ({ phone, code, purpose = "register" }) => {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const to = formatPhoneNumber(phone);

  if (!client || !fromNumber) {
    return {
      channel: "sms",
      delivered: false,
      reason: "SMS provider not configured",
    };
  }

  const message =
    purpose === "register"
      ? `Your Blood Bank registration OTP is ${code}. Valid for 10 minutes.`
      : `Your OTP is ${code}. Valid for 10 minutes.`;

  await client.messages.create({
    body: message,
    from: fromNumber,
    to,
  });

  return { channel: "sms", delivered: true };
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
