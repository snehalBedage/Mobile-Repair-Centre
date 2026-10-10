import { useEffect, useState } from "react";

import {
  getDashboardSummary,
  getCustomers,
  getDevices,
  getJobCards,
  getEstimates,
  getSpareParts,
  getPayments,
  getTechnicians,
} from "../services/dashboardApi";

const STATUS_CARDS = [
  {
    title: "Received",
    keys: ["RECEIVED"],
    color: "bg-blue-500",
  },
  {
    title: "Diagnosis",
    keys: ["DIAGNOSIS", "UNDER_DIAGNOSIS"],
    color: "bg-purple-500",
  },
  {
    title: "Waiting Approval",
    keys: ["WAITING_APPROVAL", "PENDING_APPROVAL", "ESTIMATE_PENDING"],
    color: "bg-orange-500",
  },
  {
    title: "Repair In Progress",
    keys: ["REPAIR_IN_PROGRESS", "IN_PROGRESS", "REPAIRING"],
    color: "bg-yellow-500",
  },
  {
    title: "Ready for QC",
    keys: ["READY_FOR_QC", "QC", "QUALITY_CHECK", "QUALITY_CONTROL"],
    color: "bg-cyan-500",
  },
  {
    title: "Completed",
    keys: ["COMPLETED"],
    color: "bg-emerald-500",
  },
];

const normalizeStatus = (status) =>
  String(status || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const getId = (value) => {
  if (value && typeof value === "object") {
    return value.id;
  }

  return value;
};

const getName = (value, fallback = "—") => {
  if (value && typeof value === "object") {
    return (
      value.name ||
      value.full_name ||
      value.customer_name ||
      value.part_name ||
      fallback
    );
  }

  return fallback;
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

const isToday = (dateValue) => {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  return date.toDateString() === new Date().toDateString();
};

const isPaid = (payment) =>
  normalizeStatus(payment.payment_status || payment.status) === "PAID";

const isPendingEstimate = (estimate) =>
  ["PENDING", "PENDING_APPROVAL", "WAITING_APPROVAL"].includes(
    normalizeStatus(estimate.approval_status)
  );

const getStatusClasses = (status) => {
  const value = normalizeStatus(status);

  if (value === "COMPLETED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (value === "CANCELLED") {
    return "bg-red-50 text-red-700";
  }

  if (value.includes("APPROVAL") || value.includes("PENDING")) {
    return "bg-orange-50 text-orange-700";
  }

  if (value.includes("QC") || value.includes("QUALITY")) {
    return "bg-cyan-50 text-cyan-700";
  }

  if (value.includes("PROGRESS") || value === "REPAIRING") {
    return "bg-yellow-50 text-yellow-700";
  }

  return "bg-blue-50 text-blue-700";
};

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [jobCards, setJobCards] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [payments, setPayments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [partialError, setPartialError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      setPartialError("");

      // Summary is essential. Other sections load independently.
      try {
        const data = await getDashboardSummary();

        if (isMounted) {
          setSummary(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || "Unable to load dashboard summary."
          );
        }
      }

      const requests = [
        ["job cards", getJobCards, setJobCards],
        ["estimates", getEstimates, setEstimates],
        ["payments", getPayments, setPayments],
        ["customers", getCustomers, setCustomers],
        ["devices", getDevices, setDevices],
        ["technicians", getTechnicians, setTechnicians],
      ];

      const results = await Promise.allSettled(
        requests.map(([, request]) => request())
      );

      if (!isMounted) return;

      const failedSections = [];

      results.forEach((result, index) => {
        const [sectionName, , setter] = requests[index];

        if (result.status === "fulfilled") {
          setter(Array.isArray(result.value) ? result.value : []);
        } else {
          setter([]);
          failedSections.push(sectionName);
          console.error(
            `Unable to load ${sectionName}:`,
            result.reason
          );
        }
      });

      if (failedSections.length > 0) {
        setPartialError(
          `Unable to load: ${failedSections.join(", ")}. Please check those API endpoints.`
        );
      }

      setLoading(false);
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const customerMap = new Map(
    customers.map((customer) => [
      String(customer.id),
      customer,
    ])
  );

  const deviceMap = new Map(
    devices.map((device) => [
      String(device.id),
      device,
    ])
  );

  const technicianMap = new Map(
    technicians.map((technician) => [
      String(technician.id),
      technician,
    ])
  );

  const getCustomerName = (job) => {
    const customer = job.customer;

    if (customer && typeof customer === "object") {
      return getName(customer);
    }

    const record = customerMap.get(String(getId(customer)));

    return record?.name || "—";
  };

  const getDeviceName = (job) => {
    const device = job.device;

    if (device && typeof device === "object") {
      return [device.brand, device.model].filter(Boolean).join(" ") || "—";
    }

    const record = deviceMap.get(String(getId(device)));

    return record
      ? [record.brand, record.model].filter(Boolean).join(" ") || "—"
      : "—";
  };

  
const getTechnicianName = (job) => {
  const technician = job.technician;

  // Technician assign nasel tar
  if (
    technician === null ||
    technician === undefined ||
    technician === ""
  ) {
    return "Not Assigned";
  }

  // API madhun technician object ala tar
  if (typeof technician === "object") {
    return getName(technician, "Not Assigned");
  }

  // API madhun technician ID ala tar
  const record = technicianMap.get(String(technician));

  return record?.name || "Not Assigned";
};
  const activeJobCards = jobCards.filter(
    (job) =>
      !["COMPLETED", "CANCELLED"].includes(
        normalizeStatus(job.status)
      )
  ).length;

  const pendingEstimates = estimates.filter(
    isPendingEstimate
  ).length;

  const lowStockCount =
    summary?.low_stock_parts ??
    0;

  const todaysPayments = payments.filter(
    (payment) =>
      isPaid(payment) &&
      isToday(
        payment.payment_date ||
        payment.paid_at ||
        payment.created_at
      )
  );

  const todaysTotal = todaysPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const recentJobCards = [...jobCards]
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at || a.intake_date || 0
      ).getTime();

      const dateB = new Date(
        b.created_at || b.intake_date || 0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  const displayValue = (value) => {
    if (loading) return "...";
    return value ?? 0;
  };

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-slate-500">
          Overview of your repair centre.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {partialError && (
        <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {partialError}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          {
            title: "Total Customers",
            value: summary?.total_customers,
            subtitle: "Registered customers",
            icon: "👥",
            color: "bg-blue-50",
            iconColor: "text-blue-600",
          },
          {
            title: "Active Job Cards",
            value: summary ? activeJobCards : undefined,
            subtitle: "Currently active repairs",
            icon: "🔧",
            color: "bg-emerald-50",
            iconColor: "text-emerald-600",
          },
          {
            title: "Pending Estimates",
            value: pendingEstimates,
            subtitle: "Awaiting customer approval",
            icon: "▤",
            color: "bg-orange-50",
            iconColor: "text-orange-500",
          },
          {
            title: "Low Stock Parts",
            value: lowStockCount,
            subtitle: "Parts needing attention",
            icon: "⚠",
            color: "bg-red-50",
            iconColor: "text-red-500",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h3 className="text-3xl font-bold text-slate-900 mt-2">
                  {displayValue(card.value)}
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  {card.subtitle}
                </p>
              </div>

              <div
                className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}
              >
                <span
                  className={`text-xl ${card.iconColor}`}
                  aria-hidden="true"
                >
                  {card.icon}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* REPAIR STATUS + TODAY'S PAYMENTS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Repair Status Overview
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Current repair workflow summary
            </p>
          </div>

          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {STATUS_CARDS.map((card) => {
              const count = jobCards.filter((job) =>
                card.keys.includes(normalizeStatus(job.status))
              ).length;

              return (
                <div
                  key={card.title}
                  className="bg-slate-50 rounded-lg p-4 border border-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">
                      {card.title}
                    </p>

                    <span
                      className={`w-2 h-2 rounded-full ${card.color}`}
                    />
                  </div>

                  <p className="text-xl font-bold text-slate-900 mt-2">
                    {displayValue(count)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">
              Today&apos;s Payments
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Payment summary
            </p>
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Total Collected
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {loading ? "..." : formatCurrency(todaysTotal)}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                <span className="text-xl font-bold text-emerald-600">
                  ₹
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Transactions
                </p>

                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  Today
                </span>
              </div>

              <p className="text-lg font-semibold text-slate-900 mt-2">
                {displayValue(todaysPayments.length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT JOB CARDS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-5 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            Recent Job Cards
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Latest repair jobs
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                {[
                  "Job Card",
                  "Customer",
                  "Device",
                  "Technician",
                  "Status",
                  "Priority",
                ].map((item) => (
                  <th
                    key={item}
                    className="text-left px-5 py-3 text-xs font-semibold text-white"
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading job cards...
                  </td>
                </tr>
              ) : recentJobCards.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center"
                  >
                    <p className="text-sm font-medium text-slate-500">
                      No job cards available
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      New repair jobs will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                recentJobCards.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-800 whitespace-nowrap">
                      {job.job_card_number || `#${job.id}`}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {getCustomerName(job)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {getDeviceName(job)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {getTechnicianName(job)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(job.status)}`}
                      >
                        {String(job.status || "Unknown").replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {job.priority || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;