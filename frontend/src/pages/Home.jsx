
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const heroImage =
    "https://images.pexels.com/photos/6755092/pexels-photo-6755092.jpeg";

  const services = [
    {
      number: "01",
      title: "Customer Management",
      description:
        "Manage customer profiles and service information easily.",
      color: "text-blue-600",
    },
    {
      number: "02",
      title: "Device Management",
      description:
        "Maintain complete details of customer devices and their issues.",
      color: "text-indigo-600",
    },
    {
      number: "03",
      title: "Job Card Management",
      description:
        "Create and manage repair jobs with clear repair status.",
      color: "text-emerald-600",
    },
    {
      number: "04",
      title: "Billing & Payments",
      description:
        "Manage estimates, payments, receipts and warranty details.",
      color: "text-orange-500",
    },
  ];

  const workflow = [
    {
      number: "01",
      title: "Receive Device",
      description: "Register customer and device details.",
    },
    {
      number: "02",
      title: "Diagnosis",
      description: "Identify the problem and prepare an estimate.",
    },
    {
      number: "03",
      title: "Repair",
      description: "Complete the approved repair and quality check.",
    },
    {
      number: "04",
      title: "Complete",
      description: "Complete the repair and hand over the device.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800">

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
              MR
            </div>

            <div className="text-left">
              <h1 className="text-base font-bold text-slate-900">
                Mobile Repair Centre
              </h1>

              <p className="text-xs text-slate-500">
                Repair Management System
              </p>
            </div>
          </button>

          {/* Navigation */}
          <nav className="hidden items-center gap-7 lg:flex">

            <a
              href="#home"
              className="text-sm font-semibold text-blue-600"
            >
              Home
            </a>

            <a
              href="#services"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Services
            </a>

            <a
              href="#workflow"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              About
            </a>

            <a
              href="#contact"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Contact
            </a>

          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/login")}
              className="hidden px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-blue-600 sm:block"
            >
              Login
            </button>

            <button
              onClick={() => navigate("/register")}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
            >
              Register
            </button>

          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section id="home">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">

          {/* Left */}
          <div>

            <p className="mb-5 text-sm font-semibold text-blue-600">
              Smart Repair Centre Management
            </p>

            <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Manage Your
              <span className="block text-blue-600">
                Repair Centre Better.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              A professional repair management system to manage customers,
              devices, job cards, technicians, billing and repair progress
              from one simple platform.
            </p>

            <div className="mt-8">
              <button
                onClick={() => navigate("/register")}
                className="rounded-lg bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
              >
                Get Started
              </button>
            </div>

          </div>

          {/* Image */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <img
              src={heroImage}
              alt="Mobile repair technician"
              className="h-[420px] w-full object-cover"
            />
          </div>

        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section id="services" className="border-t border-slate-100">

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          <div className="max-w-2xl">

            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Our Services
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              Everything your repair centre needs.
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Manage your complete repair operations through one organized
              system.
            </p>

          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {services.map((service) => (
              <div
                key={service.number}
                className="group min-h-[220px] rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-lg hover:shadow-slate-200/60"
              >

                <div className="flex items-center justify-between">
                  <span
                    className={`text-2xl font-bold ${service.color}`}
                  >
                    {service.number}
                  </span>

                  <span className="text-lg text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-blue-500">
                    →
                  </span>
                </div>

                <h4 className="mt-6 text-base font-bold text-slate-900">
                  {service.title}
                </h4>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {service.description}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= WORKFLOW ================= */}
      <section
        id="workflow"
        className="border-y border-slate-100 bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              How It Works
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              Simple repair workflow
            </h3>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600">
              A clear process helps your team manage every repair from
              receiving the device to completion.
            </p>

          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">

            {workflow.map((step) => (
              <div
                key={step.number}
                className="rounded-xl border border-slate-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
              >

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-600 bg-white text-sm font-bold text-blue-600">
                  {step.number}
                </div>

                <h4 className="mt-5 font-bold text-slate-900">
                  {step.title}
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* ================= ABOUT ================= */}
      <section id="about">

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-8">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              About The System
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              Built to simplify everyday repair operations.
            </h3>

            <p className="mt-5 leading-7 text-slate-600">
              Mobile Repair Centre Management System helps repair businesses
              manage their complete service cycle in one place — from
              customer registration and device intake to job cards, estimates,
              repairs, payments and warranty management.
            </p>

            <button
              onClick={() => navigate("/register")}
              className="mt-7 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Get Started
            </button>

          </div>

          <div className="grid grid-cols-2 gap-5">

            <div className="min-h-[170px] rounded-xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
              <p className="text-2xl font-bold text-blue-600">01</p>
              <h4 className="mt-4 font-bold text-slate-900">
                Centralized Data
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep customer and repair information organized.
              </p>
            </div>

            <div className="min-h-[170px] rounded-xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
              <p className="text-2xl font-bold text-indigo-600">02</p>
              <h4 className="mt-4 font-bold text-slate-900">
                Better Control
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage daily repair activities efficiently.
              </p>
            </div>

            <div className="min-h-[170px] rounded-xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md">
              <p className="text-2xl font-bold text-emerald-600">03</p>
              <h4 className="mt-4 font-bold text-slate-900">
                Easy Tracking
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Follow repair progress through job card status.
              </p>
            </div>

            <div className="min-h-[170px] rounded-xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md">
              <p className="text-2xl font-bold text-orange-500">04</p>
              <h4 className="mt-4 font-bold text-slate-900">
                Secure Access
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Access is managed according to user roles.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section id="contact" className="border-t border-slate-100">

        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          <div className="text-center">

            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Contact
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-900">
              Need help with your repair centre?
            </h3>

            <p className="mt-4 text-slate-600">
              Get in touch with our team for support or general enquiries.
            </p>

          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">

            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                support@mobilerepaircentre.com
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md">
              <p className="text-sm text-slate-500">Phone</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                +91 98765 43210
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md">
              <p className="text-sm text-slate-500">Support</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                Mon – Sat, 9 AM – 6 PM
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-slate-900">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-7 sm:flex-row lg:px-8">

          <div>
            <p className="text-sm font-semibold text-white">
              Mobile Repair Centre
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Repair Management System
            </p>
          </div>

          <p className="text-xs text-slate-400">
            © 2026 Mobile Repair Centre. All rights reserved.
          </p>

        </div>
      </footer>

    </div>
  );
}

export default Home;

