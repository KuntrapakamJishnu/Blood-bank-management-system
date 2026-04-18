import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const subject = encodeURIComponent("Password reset request");
    const body = encodeURIComponent(
      `Please reset the password for this account: ${email}`,
    );

    window.location.href = `mailto:bloodbankadmin@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
        <p className="text-sm text-gray-600 mb-4">
          Password reset is handled by email support right now.
        </p>
        <input
          type="email"
          placeholder="Enter Email"
          className="border p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button className="bg-purple-500 text-white py-2 px-4 rounded w-full">
          Request Reset via Email
        </button>
        <div className="mt-4 text-sm text-gray-600 text-center">
          Back to <Link to="/login" className="text-red-600 hover:underline">Login</Link>
        </div>
      </form>
    </div>
  );
}