import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const data = await forgotPassword(email);

      setMessage(data.message);

      // Temporary development testing
      if (data.uid && data.token) {
        localStorage.setItem("reset_uid", data.uid);
        localStorage.setItem("reset_token", data.token);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-white flex items-center justify-center px-4">

      <div className="w-full max-w-sm">

        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">

          <div className="h-1 bg-blue-700"></div>

          <div className="p-6">

            {/* Heading */}
            <div className="text-center mb-5">

              <h1 className="text-3xl font-bold text-slate-900">
                Forgot Password
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Enter your email to reset your password
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs text-red-600 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {message && (
              <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-3 py-2">
                <p className="text-xs text-green-700 text-center">
                  {message}
                </p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div>

                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="
                    w-full h-10 px-3
                    rounded-md
                    border border-slate-300
                    text-sm text-slate-900
                    placeholder-slate-400
                    outline-none
                    transition
                    focus:border-blue-600
                    focus:ring-2 focus:ring-blue-100
                  "
                />

              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  w-full h-10
                  rounded-md
                  bg-blue-700
                  text-white
                  text-sm
                  font-semibold
                  transition-all
                  duration-200
                  hover:bg-blue-800
                  hover:shadow-md
                  hover:-translate-y-0.5
                  active:translate-y-0
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                "
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

            </form>

            {/* Back to Login */}
            <div className="mt-5 pt-4 border-t border-slate-200 text-center">

              <button
                type="button"
                onClick={() => navigate("/")}
                className="
                  text-xs
                  font-semibold
                  text-blue-700
                  hover:text-blue-900
                  hover:underline
                "
              >
                ← Back to Login
              </button>

            </div>

          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-400 mt-3">
          © 2026 Repair Management System
        </p>

      </div>

    </div>
  );
}

export default ForgotPassword;