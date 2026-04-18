import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

const OTP_DIGITS = /^[0-9]{6}$/;
const INDIAN_PHONE = /^[6-9][0-9]{9}$/;

const statusStyles = {
  idle: "bg-slate-100 text-slate-600",
  sent: "bg-amber-50 text-amber-700",
  verified: "bg-emerald-50 text-emerald-700",
  error: "bg-rose-50 text-rose-700",
};

const channelConfig = {
  email: {
    label: "Email OTP",
    helper: "Check your inbox and enter the 6-digit code.",
    placeholder: "Enter email OTP",
  },
  sms: {
    label: "SMS OTP",
    helper: "Enter the code sent to your phone number.",
    placeholder: "Enter SMS OTP",
  },
};

const ChannelCard = ({
  channel,
  value,
  onChange,
  onVerify,
  status,
  loading,
  disabled,
  showDevOtp,
  devOtp,
}) => {
  const config = channelConfig[channel];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{config.label}</p>
          <p className="mt-1 text-xs text-slate-500">{config.helper}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
        >
          {status === "verified"
            ? "Verified"
            : status === "sent"
              ? "Code sent"
              : status === "error"
                ? "Needs attention"
                : "Not sent"}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={onChange}
          maxLength={6}
          placeholder={config.placeholder}
          className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
        />
        <button
          type="button"
          onClick={onVerify}
          disabled={disabled || loading || !OTP_DIGITS.test(value)}
          className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verifying..." : status === "verified" ? "Verified" : "Verify"}
        </button>
      </div>

      {showDevOtp && (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          Dev OTP: <span className="font-semibold text-slate-800">{devOtp}</span>
        </p>
      )}
    </div>
  );
};

export default function OtpVerificationPanel({
  email,
  phone,
  authBaseUrl,
  purpose = "register",
  onStateChange,
  className = "",
}) {
  const [emailCode, setEmailCode] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState({ email: false, sms: false });
  const [sentChannels, setSentChannels] = useState({ email: false, sms: false });
  const [verifiedChannels, setVerifiedChannels] = useState({ email: false, sms: false });
  const [devOtp, setDevOtp] = useState("");
  const [deliveryWarning, setDeliveryWarning] = useState("");

  const hasValidPhone = useMemo(() => INDIAN_PHONE.test((phone || "").trim()), [phone]);

  useEffect(() => {
    setEmailCode("");
    setSmsCode("");
    setRequesting(false);
    setVerifying({ email: false, sms: false });
    setSentChannels({ email: false, sms: false });
    setVerifiedChannels({ email: false, sms: false });
    setDevOtp("");
    setDeliveryWarning("");
  }, [email, phone]);

  useEffect(() => {
    if (typeof onStateChange === "function") {
      onStateChange({
        emailVerified: verifiedChannels.email,
        smsVerified: verifiedChannels.sms,
        ready: verifiedChannels.email && (!hasValidPhone || verifiedChannels.sms),
      });
    }
  }, [hasValidPhone, onStateChange, verifiedChannels.email, verifiedChannels.sms]);

  const requestOtp = async () => {
    const normalizedEmail = (email || "").trim();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      toast.error("Enter a valid email before requesting OTP");
      return;
    }

    const channel = hasValidPhone ? "both" : "email";

    setRequesting(true);
    setDeliveryWarning("");
    try {
      const response = await fetch(`${authBaseUrl}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          phone: hasValidPhone ? phone : undefined,
          channel,
          purpose,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setSentChannels({ email: true, sms: hasValidPhone });
      setVerifiedChannels({ email: false, sms: false });
      setDevOtp(data.devOtp || "");

      const failedChannels = Array.isArray(data?.delivery?.results)
        ? data.delivery.results
            .filter((result) => !result.delivered)
            .map((result) => `${result.channel}: ${result.reason || "not delivered"}`)
        : [];

      if (failedChannels.length) {
        setDeliveryWarning(failedChannels.join(" • "));
      }

      toast.success(hasValidPhone ? "Email and SMS OTPs sent" : "Email OTP sent");
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setRequesting(false);
    }
  };

  const verifyChannel = async (channel) => {
    const code = channel === "email" ? emailCode : smsCode;

    if (!OTP_DIGITS.test(code)) {
      toast.error("Enter a valid 6-digit OTP");
      return;
    }

    if (channel === "sms" && !hasValidPhone) {
      toast.error("Add a valid phone number to verify SMS OTP");
      return;
    }

    setVerifying((prev) => ({ ...prev, [channel]: true }));
    try {
      const response = await fetch(`${authBaseUrl}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: (email || "").trim(),
          phone: channel === "sms" ? phone : undefined,
          channel,
          code,
          purpose,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setVerifiedChannels((prev) => ({ ...prev, [channel]: true }));
      toast.success(data.message || `${channel.toUpperCase()} OTP verified successfully`);
    } catch (error) {
      setVerifiedChannels((prev) => ({ ...prev, [channel]: false }));
      toast.error(error.message || "OTP verification failed");
    } finally {
      setVerifying((prev) => ({ ...prev, [channel]: false }));
    }
  };

  const emailStatus = verifiedChannels.email
    ? "verified"
    : sentChannels.email
      ? "sent"
      : "idle";
  const smsStatus = verifiedChannels.sms
    ? "verified"
    : sentChannels.sms
      ? "sent"
      : "idle";

  return (
    <section className={`rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-white p-4 shadow-sm sm:p-5 ${className}`}>
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-600">
            Verification
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            Verify email and SMS before continuing
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            We send the email OTP first. If your phone number is valid, the form also enables SMS OTP verification in a separate aligned block.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className={`rounded-full px-3 py-1 ${statusStyles[emailStatus]}`}>
            Email {verifiedChannels.email ? "verified" : sentChannels.email ? "sent" : "pending"}
          </span>
          {hasValidPhone && (
            <span className={`rounded-full px-3 py-1 ${statusStyles[smsStatus]}`}>
              SMS {verifiedChannels.sms ? "verified" : sentChannels.sms ? "sent" : "pending"}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={requestOtp}
          disabled={requesting || !/^\S+@\S+\.\S+$/.test((email || "").trim())}
          className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {requesting ? "Sending OTP..." : hasValidPhone ? "Send Email + SMS OTP" : "Send Email OTP"}
        </button>

        <p className="text-sm text-slate-500">
          {hasValidPhone
            ? "Both channels must be verified before registration."
            : "Add a valid phone number to enable SMS verification."}
        </p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChannelCard
          channel="email"
          value={emailCode}
          onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          onVerify={() => verifyChannel("email")}
          status={emailStatus}
          loading={verifying.email}
          disabled={!sentChannels.email}
          showDevOtp={Boolean(devOtp)}
          devOtp={devOtp}
        />

        {hasValidPhone ? (
          <ChannelCard
            channel="sms"
            value={smsCode}
            onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onVerify={() => verifyChannel("sms")}
            status={smsStatus}
            loading={verifying.sms}
            disabled={!sentChannels.sms}
          />
        ) : (
          <div className="flex min-h-[172px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            SMS verification appears here once a valid phone number is entered.
          </div>
        )}
      </div>

      {deliveryWarning && (
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {deliveryWarning}
        </p>
      )}
    </section>
  );
}