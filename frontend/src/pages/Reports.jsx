
import { useEffect, useState } from "react";
import api from "../services/api";

const reportCards = [
  {
    key: "total_customers",
    label: "Total Customers",
  },
  {
    key: "total_devices",
    label: "Total Devices",
  },
  {
    key: "total_job_cards",
    label: "Total Job Cards",
  },
  {
    key: "completed_repairs",
    label: "Completed Repairs",
  },
  {
    key: "pending_repairs",
    label: "Pending Repairs",
  },
  {
    key: "cancelled_repairs",
    label: "Cancelled Repairs",
  },
  {
    key: "low_stock_parts",
    label: "Low Stock Parts",
  },
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [jobStatuses, setJobStatuses] = useState({});
  const [revenue, setRevenue] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReports() {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.all([
          api.get("reports/dashboard-summary/"),
          api.get("reports/job-card-status/"),
          api.get("reports/revenue/"),
          api.get("reports/inventory/"),
          api.get("reports/repair-performance/"),
        ]);

        if (!active) return;

        setSummary(results[0].data);
        setJobStatuses(results[1].data);
        setRevenue(results[2].data);
        setInventory(results[3].data);
        setPerformance(results[4].data);
      } catch (err) {
        if (!active) return;

        setError(
          err.response?.data?.detail ||
            "Reports load झाले नाहीत. API URL आणि login तपासा."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReports();

    return () => {
      active = false;
    };
  }, []);

  const downloadCSV = () => {
    const rows = [
      ["Mobile Repair Centre - Reports"],
      [],
      ["Dashboard Summary", "Value"],
      ...reportCards.map((card) => [
        card.label,
        summary?.[card.key] ?? 0,
      ]),
      ["Total Revenue", summary?.total_revenue ?? 0],
      [],
      ["Job Card Status", "Count"],
      ...Object.entries(jobStatuses),
      [],
      ["Payment Summary", "Amount / Count"],
      ["Total Payments", revenue?.total_payments ?? 0],
      ["Paid Amount", revenue?.total_paid_amount ?? 0],
      ["Pending Amount", revenue?.total_pending_amount ?? 0],
      ["Failed Amount", revenue?.total_failed_amount ?? 0],
      [],
      ["Inventory Summary", "Value"],
      ["Total Parts", inventory?.total_parts ?? 0],
      ["Available Stock", inventory?.total_available_stock ?? 0],
      ["Low Stock Parts", inventory?.low_stock_parts ?? 0],
      ["Out of Stock Parts", inventory?.out_of_stock_parts ?? 0],
      [],
      ["Repair Performance", "Count"],
      ["Total Repairs", performance?.total_repairs ?? 0],
      ["Completed Repairs", performance?.completed_repairs ?? 0],
      ["Pending Repairs", performance?.pending_repairs ?? 0],
      ["Repairs In Progress", performance?.repair_in_progress ?? 0],
      ["Cancelled Repairs", performance?.cancelled_repairs ?? 0],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mobile-repair-centre-reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-600">
        Loading reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-700">
          Reports Load Error
        </h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              ADMINISTRATION
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Reports
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Repair centre business overview and performance.
            </p>
          </div>

          <button
            onClick={downloadCSV}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Download CSV
          </button>
        </div>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Dashboard Summary
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {reportCards.map((card) => (
              <div
                key={card.key}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {summary?.[card.key] ?? 0}
                </p>
              </div>
            ))}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="mt-3 text-2xl font-bold text-emerald-700">
                {formatCurrency(summary?.total_revenue)}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <h2 className="bg-slate-900 px-5 py-4 font-semibold text-white">
              Job Card Status Report
            </h2>

            <div className="p-5">
              {Object.keys(jobStatuses).length === 0 ? (
                <p className="text-sm text-slate-500">
                  No job status data available.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(jobStatuses).map(([name, count]) => {
                    const total = Object.values(jobStatuses).reduce(
                      (sum, value) => sum + Number(value || 0),
                      0
                    );

                    const percent = total
                      ? (Number(count) / total) * 100
                      : 0;

                    return (
                      <div key={name}>
                        <div className="mb-1 flex justify-between gap-3 text-sm">
                          <span className="text-slate-600">
                            {name.replaceAll("_", " ")}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <h2 className="bg-slate-900 px-5 py-4 font-semibold text-white">
              Revenue & Payment Report
            </h2>

            <div className="space-y-4 p-5">
              {[
                ["Total Payments", revenue?.total_payments ?? 0],
                [
                  "Paid Amount",
                  formatCurrency(revenue?.total_paid_amount),
                ],
                [
                  "Pending Amount",
                  formatCurrency(revenue?.total_pending_amount),
                ],
                [
                  "Failed Amount",
                  formatCurrency(revenue?.total_failed_amount),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                >
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">
                    {value}
                  </span>
                </div>
              ))}

              <h3 className="pt-2 text-sm font-semibold text-slate-800">
                Paid Amount by Payment Method
              </h3>

              {Object.entries(revenue?.payment_method_wise ?? {}).map(
                ([method, amount]) => (
                  <div
                    key={method}
                    className="flex justify-between gap-4 text-sm"
                  >
                    <span className="text-slate-600">{method}</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <h2 className="bg-slate-900 px-5 py-4 font-semibold text-white">
              Inventory Report
            </h2>

            <div className="space-y-4 p-5">
              {[
                ["Total Parts", inventory?.total_parts],
                ["Available Stock", inventory?.total_available_stock],
                ["Low Stock Parts", inventory?.low_stock_parts],
                ["Out of Stock Parts", inventory?.out_of_stock_parts],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                >
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">
                    {value ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <h2 className="bg-slate-900 px-5 py-4 font-semibold text-white">
              Repair Performance
            </h2>

            <div className="space-y-4 p-5">
              {[
                ["Total Repairs", performance?.total_repairs],
                ["Completed Repairs", performance?.completed_repairs],
                ["Pending Repairs", performance?.pending_repairs],
                ["Repair In Progress", performance?.repair_in_progress],
                ["Cancelled Repairs", performance?.cancelled_repairs],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0"
                >
                  <span className="text-sm text-slate-600">{label}</span>
                  <span className="font-semibold text-slate-900">
                    {value ?? 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <p className="text-xs text-slate-500">
          Report data is loaded from the backend APIs. CSV export downloads
          the data currently displayed on this page.
        </p>
      </div>
    </div>
  );
}
