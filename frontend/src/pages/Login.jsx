import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      console.log("Login successful:", data);

      // JWT tokens save
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // User information save
      localStorage.setItem("user_role", data.role);
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("user_email", data.email);

      alert(`Login successful! Welcome ${data.name}`);

    if (data.role === "ADMIN") {
        navigate("/admin-dashboard");
    } else if (data.role === "STAFF") {
  navigate("/staff-dashboard");
    } else if (data.role === "CUSTOMER") {
        navigate("/customer-dashboard");
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

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">

          {/* Top Accent */}
          <div className="h-1 bg-blue-700"></div>

          <div className="p-6">

            {/* Heading */}
            <div className="text-center mb-5">

              <h1 className="text-3xl font-bold text-slate-900">
                Welcome Back
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Sign in to continue to your account
              </p>

            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2">
                <p className="text-xs text-red-600 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Login Form */}
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

              {/* Password */}
              <div>

                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="
                      w-full h-10 px-3 pr-14
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

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="
                      absolute right-3 top-1/2
                      -translate-y-1/2
                      text-[11px]
                      font-semibold
                      text-slate-500
                      hover:text-blue-700
                    "
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>

                </div>

              </div>

              {/* Login Button */}
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
                  disabled:hover:translate-y-0
                "
              >
                {loading ? "Signing In..." : "Login"}
              </button>

              {/* Forgot Password */}
              <div className="text-center">

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="
                    text-xs
                    font-medium
                    text-blue-700
                    hover:text-blue-900
                    hover:underline
                  "
                >
                  Forgot Password?
                </button>

              </div>

            </form>

            {/* Registration */}
            <div className="mt-5 pt-4 border-t border-slate-200 text-center">

              <p className="text-xs text-slate-500">
                Don't have an account?
              </p>

              <a
                href="/register"
                className="
                  mt-1.5
                  inline-block
                  text-xs
                  font-semibold
                  text-blue-700
                  hover:text-blue-900
                  hover:underline
                "
              >
                Register as Customer
              </a>

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

export default Login;