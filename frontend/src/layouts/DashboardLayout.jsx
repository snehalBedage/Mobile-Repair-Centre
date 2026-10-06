import { useState } from "react";
import { useNavigate } from "react-router-dom";

function DashboardLayout({ children, role }) {
  const navigate = useNavigate();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const name = localStorage.getItem("user_name") || "User";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_email");

    navigate("/");
  };

  const adminMenu = [
    "Dashboard",
    "Customers",
    "Devices",
    "Technicians",
    "Job Cards",
    "Estimates",
    "Spare Parts",
    "Payments",
    "Warranty",
    "Reports",
    "Users & Roles",
    "Audit Logs",
    "Settings",
  ];

  const staffMenu = [
    "Dashboard",
    "Customers",
    "Devices",
    "Technicians",
    "Job Cards",
    "Estimates",
    "Spare Parts",
    "Payments",
    "Warranty",
    "Settings",
  ];

  const customerMenu = [
    "Dashboard",
    "Devices",
    "Repairs",
    "Estimates",
    "Payments",
    "Warranty",
    "Track Repair",
  ];

  const menu =
    role === "ADMIN"
      ? adminMenu
      : role === "STAFF"
      ? staffMenu
      : customerMenu;

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ================= SIDEBAR ================= */}

      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white flex flex-col z-40">

        {/* Logo */}
        <div className="h-20 px-5 flex items-center border-b border-slate-800 shrink-0">

          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mr-3">

            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <rect
                x="7"
                y="3"
                width="10"
                height="18"
                rx="2"
              />

              <path
                strokeLinecap="round"
                d="M10 6h4"
              />

              <circle
                cx="12"
                cy="18"
                r="0.7"
                fill="currentColor"
                stroke="none"
              />
            </svg>

          </div>

          <div className="min-w-0">

            <h1 className="text-sm font-bold text-white truncate">
              Mobile Repair Centre
            </h1>

            <p className="text-[10px] text-slate-400 mt-0.5">
              Repair Management System
            </p>

          </div>

        </div>


        {/* ================= SCROLLABLE SIDEBAR MENU ================= */}

        <nav className="flex-1 px-3 py-3 overflow-y-auto">

          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Main Menu
          </p>

          <div className="space-y-0.5">

            {menu.map((item) => (

              <button
                key={item}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm transition-colors duration-150 ${
                  item === "Dashboard"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >

                <span className="w-7 h-7 flex items-center justify-center mr-2.5 text-sm">

                  {item === "Dashboard" && "▦"}
                  {item === "Customers" && "♙"}
                  {item === "Devices" && "▯"}
                  {item === "Technicians" && "⚒"}
                  {item === "Job Cards" && "▤"}
                  {item === "Estimates" && "▥"}
                  {item === "Spare Parts" && "◇"}
                  {item === "Payments" && "▭"}
                  {item === "Warranty" && "✓"}
                  {item === "Reports" && "▥"}
                  {item === "Users & Roles" && "♙"}
                  {item === "Audit Logs" && "☷"}
                  {item === "Settings" && "⚙"}
                  {item === "Repairs" && "⚒"}
                  {item === "Track Repair" && "⌖"}

                </span>

                <span className="truncate">
                  {item}
                </span>

              </button>

            ))}

          </div>

        </nav>


        {/* ================= LOGOUT ================= */}

        <div className="px-3 py-3 border-t border-slate-800 shrink-0">

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors duration-150"
          >

            <span className="w-7 h-7 flex items-center justify-center mr-2.5">
              ⇥
            </span>

            Logout

          </button>

        </div>

      </aside>


      {/* ================= RIGHT SIDE ================= */}

      <div className="ml-64 min-h-screen flex flex-col">


        {/* ================= HEADER ================= */}

        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">

          {/* ONLY ONE DASHBOARD */}
          <h1 className="text-xl font-bold text-slate-900">
            Dashboard
          </h1>


          <div className="flex items-center gap-4">

            {/* ================= NOTIFICATION ================= */}

            <button
              className="relative w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
            >

              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                />

                <path
                  strokeLinecap="round"
                  d="M10 21h4"
                />

              </svg>

              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>

            </button>


            {/* ================= USER ================= */}

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">

              <div className="text-right">

                <p className="text-sm font-semibold text-slate-800">
                  {name}
                </p>

                <p className="text-[11px] text-slate-500">
                  {role}
                </p>

              </div>


              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">

                <span className="text-sm font-bold text-blue-700">
                  {name.charAt(0).toUpperCase()}
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* ================= MAIN CONTENT ================= */}

        <main className="flex-1 p-6 overflow-y-auto">

          {children}

        </main>


        {/* ================= FOOTER ================= */}

        <footer className="h-12 bg-white border-t border-slate-200 flex items-center justify-center shrink-0">

          <p className="text-xs text-slate-500">
            © 2026 Mobile Repair Centre — Repair Management System
          </p>

        </footer>

      </div>


      {/* ================= LOGOUT POPUP ================= */}

      {showLogoutConfirm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">

          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200">

            <div className="h-1 bg-blue-700 rounded-t-xl"></div>

            <div className="p-6">

              <h2 className="text-lg font-bold text-slate-900">
                Confirm Logout
              </h2>

              <p className="text-sm text-slate-500 mt-2">
                Are you sure you want to logout from your account?
              </p>

              <div className="flex justify-end gap-3 mt-6">

                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-4 py-2 rounded-md border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700"
                >
                  Logout
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default DashboardLayout;