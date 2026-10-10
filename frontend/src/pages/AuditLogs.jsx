
import { useEffect, useState } from "react";
import api from "../services/api";

const TABLE_OPTIONS = [
  { value: "", label: "All Tables" },
  { value: "PAYMENTS", label: "Payments" },
  { value: "JOB_CARDS", label: "Job Cards" },
];

function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [tableName, setTableName] = useState("");
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};

        if (search.trim()) params.search = search.trim();
        if (tableName) params.table_name = tableName;
        if (action.trim()) params.action = action.trim();

        const response = await api.get("/audit-logs/", {
          params,
          signal: controller.signal,
        });

        setAuditLogs(
          Array.isArray(response.data) ? response.data : []
        );
      } catch (err) {
        if (
          err.name !== "CanceledError" &&
          err.code !== "ERR_CANCELED"
        ) {
          setError(
            err.response?.data?.detail ||
              "Unable to load audit logs. Please try again."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchAuditLogs, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, tableName, action]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString();
  };

  const clearFilters = () => {
    setSearch("");
    setTableName("");
    setAction("");
  };

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Page Header */}
        <div className="border-b border-slate-200 pb-5">
          <p className="text-sm font-medium text-blue-600">
            Administration
          </p>

          <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Audit Logs
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View and monitor recorded system activities.
              </p>
            </div>

            <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
              {loading ? "Loading records..." : `${auditLogs.length} records`}
            </span>
          </div>
        </div>

        {/* Filters */}
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-800">
              Search and Filters
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Find activities by user, table, or action.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label htmlFor="audit-search" className={labelClass}>
                Search
              </label>

              <input
                id="audit-search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users or activities"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="audit-table" className={labelClass}>
                Table
              </label>

              <select
                id="audit-table"
                value={tableName}
                onChange={(event) => setTableName(event.target.value)}
                className={inputClass}
              >
                {TABLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="audit-action" className={labelClass}>
                Action
              </label>

              <input
                id="audit-action"
                type="text"
                value={action}
                onChange={(event) => setAction(event.target.value)}
                placeholder="Filter by action"
                className={inputClass}
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </section>

        {/* Activity Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-800">
              Activity History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A record of activities stored by the system.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-900">
                <tr>
                  {[
                    "Date & Time",
                    "User",
                    "Action",
                    "Table",
                    "Record ID",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="whitespace-nowrap px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-white"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Loading audit logs...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      Data could not be loaded.
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center">
                      <p className="text-sm font-semibold text-slate-700">
                        No audit logs found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing the filters or clear them to see all records.
                      </p>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(log.created_at)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-800">
                        {log.user_name || "—"}
                      </td>

                      <td className="min-w-64 px-5 py-4 text-sm text-slate-700">
                        {log.action || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {log.table_name || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {log.record_id ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 bg-white px-5 py-3">
            <p className="text-xs text-slate-500">
              Audit records are displayed according to the selected filters.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuditLogs;
