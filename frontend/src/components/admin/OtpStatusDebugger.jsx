import { useState } from "react";
import { toast } from "react-hot-toast";
import { CheckCircle, Clock, Shield } from "lucide-react";

const OtpStatusDebugger = ({ className = "", description }) => {
  const [otpDebugEmail, setOtpDebugEmail] = useState("");
  const [otpDebugPurpose, setOtpDebugPurpose] = useState("register");
  const [otpDebugLoading, setOtpDebugLoading] = useState(false);
  const [otpDebugResult, setOtpDebugResult] = useState(null);

  const fetchOtpStatus = async () => {
    const email = otpDebugEmail.trim().toLowerCase();
    if (!email) {
      toast.error("Enter a user email to check OTP status");
      return;
    }

    try {
      setOtpDebugLoading(true);
      setOtpDebugResult(null);

      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const res = await fetch("/api/auth/otp-status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, purpose: otpDebugPurpose }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch OTP status");
      }

      setOtpDebugResult(data);
      toast.success("OTP status loaded");
    } catch (error) {
      toast.error(error.message || "Unable to fetch OTP status");
    } finally {
      setOtpDebugLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-red-100 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <Shield className="w-5 h-5 text-red-600" />
        OTP Verification Debugger
      </h2>
      <p className="text-sm text-gray-600 mb-5">
        {description || "Inspect email and SMS OTP verification state before registration."}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <input
          type="email"
          value={otpDebugEmail}
          onChange={(e) => setOtpDebugEmail(e.target.value)}
          placeholder="Enter user email"
          className="md:col-span-2 border border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-lg px-3 py-2 outline-none"
        />

        <select
          value={otpDebugPurpose}
          onChange={(e) => setOtpDebugPurpose(e.target.value)}
          className="border border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 rounded-lg px-3 py-2 outline-none bg-white"
        >
          <option value="register">register</option>
        </select>

        <button
          type="button"
          onClick={fetchOtpStatus}
          disabled={otpDebugLoading}
          className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-medium transition-colors disabled:opacity-50"
        >
          {otpDebugLoading ? "Checking..." : "Check OTP Status"}
        </button>
      </div>

      {otpDebugResult?.otp && (
        <div className="border border-red-100 rounded-xl p-4 bg-red-50/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 border border-red-100">
              <p className="text-xs text-gray-500">Required Channels</p>
              <p className="font-semibold text-gray-800 mt-1">
                {otpDebugResult.otp.requiredChannels?.join(", ") || "email"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-red-100">
              <p className="text-xs text-gray-500">Master Status</p>
              <p
                className={`font-semibold mt-1 ${otpDebugResult.otp.verified ? "text-green-600" : "text-amber-600"}`}
              >
                {otpDebugResult.otp.verified ? "Fully Verified" : "Pending Verification"}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-red-100">
              <p className="text-xs text-gray-500">Expires</p>
              <p
                className={`font-semibold mt-1 ${otpDebugResult.otp.isExpired ? "text-red-600" : "text-gray-800"}`}
              >
                {otpDebugResult.otp.expiresAt
                  ? new Date(otpDebugResult.otp.expiresAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-3 border border-red-100 flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${otpDebugResult.otp.verifiedChannels?.email ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
              >
                {otpDebugResult.otp.verifiedChannels?.email ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">Email OTP</p>
                <p className="text-sm text-gray-600">
                  {otpDebugResult.otp.verifiedChannels?.email ? "Verified" : "Not verified"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-red-100 flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${otpDebugResult.otp.verifiedChannels?.sms ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
              >
                {otpDebugResult.otp.verifiedChannels?.sms ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">SMS OTP</p>
                <p className="text-sm text-gray-600">
                  {otpDebugResult.otp.verifiedChannels?.sms ? "Verified" : "Not verified"}
                </p>
                {otpDebugResult.otp.phone && (
                  <p className="text-xs text-gray-500 mt-1">Phone: {otpDebugResult.otp.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {otpDebugResult && !otpDebugResult.otp && (
        <div className="border border-red-100 rounded-xl p-4 bg-red-50/40 text-sm text-gray-700">
          No OTP record found for this email.
        </div>
      )}
    </div>
  );
};

export default OtpStatusDebugger;
