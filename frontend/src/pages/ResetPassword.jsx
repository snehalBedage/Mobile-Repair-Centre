import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../services/api";

function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(
        uid,
        token,
        newPassword,
        confirmPassword
      );

      setMessage(data.message);

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/");
      }, 2000);

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

            <div className="text-center mb-5">
              <h1 className="text-3xl font-bold text-slate-900">
                Reset Password
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Enter your new password below
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs text-red-600 text-center">
                  {error}
                </p>
              </div>
            )}

            {message && (
              <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-3 py-2">
                <p className="text-xs text-green-700 text-center">
                  {message}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
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
                {loading ? "Resetting..." : "Reset Password"}
              </button>

            </form>

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

        <p className="text-center text-[10px] text-slate-400 mt-3">
          © 2026 Repair Management System
        </p>

      </div>

    </div>
  );
}

export default ResetPassword;