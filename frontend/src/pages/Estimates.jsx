
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const EMPTY_FORM = {
  job_card: "",
  service_cost: "",
  parts_cost: "",
};

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getErrorMessage(error) {
  const data = error.response?.data;

  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, messages]) => {
        const message = Array.isArray(messages)
          ? messages.join(", ")
          : String(messages);
        return `${field}: ${message}`;
      })
      .join("\n");
  }

  return error.message || "Something went wrong. Please try again.";
}

function formatAmount(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN");
}

function getStatusStyle(status) {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-700";
  }
}

function getJobCardNumber(jobCard) {
  if (!jobCard) return "—";

  if (typeof jobCard === "object") {
    return (
      jobCard.job_card_number ||
      (jobCard.id ? `Job Card #${jobCard.id}` : "—")
    );
  }

  return `Job Card #${jobCard}`;
}

function getCustomerName(estimate, jobCardMap) {
  if (estimate.customer_name) return estimate.customer_name;

  const jobCard =
    typeof estimate.job_card === "object"
      ? estimate.job_card
      : jobCardMap.get(Number(estimate.job_card));

  return (
    jobCard?.customer_name ||
    jobCard?.customer_details?.name ||
    jobCard?.customer?.name ||
    "—"
  );
}

function getDeviceName(estimate, jobCardMap) {
  if (estimate.device_name) return estimate.device_name;

  const jobCard =
    typeof estimate.job_card === "object"
      ? estimate.job_card
      : jobCardMap.get(Number(estimate.job_card));

  return (
    jobCard?.device_name ||
    jobCard?.device_details?.model ||
    (
      jobCard?.device?.brand && jobCard?.device?.model
        ? `${jobCard.device.brand} ${jobCard.device.model}`
        : jobCard?.device?.model
    ) ||
    "—"
  );
}

function Estimates() {
  const [estimates, setEstimates] = useState([]);
  const [jobCards, setJobCards] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const totalAmount =
    (Number(form.service_cost) || 0) +
    (Number(form.parts_cost) || 0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [estimateResponse, jobCardResponse] = await Promise.all([
        api.get("estimates/"),
        api.get("job-cards/"),
      ]);

      setEstimates(getList(estimateResponse.data));
      setJobCards(getList(jobCardResponse.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pendingCount = estimates.filter(
    (item) => item.approval_status === "PENDING"
  ).length;

  const approvedCount = estimates.filter(
    (item) => item.approval_status === "APPROVED"
  ).length;

  const rejectedCount = estimates.filter(
    (item) => item.approval_status === "REJECTED"
  ).length;

  const jobCardMap = useMemo(
    () => new Map(jobCards.map((jobCard) => [Number(jobCard.id), jobCard])),
    [jobCards]
  );

  const filteredEstimates = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return estimates.filter((estimate) => {
      const jobCardNumber =
        estimate.job_card_number ||
        getJobCardNumber(estimate.job_card);

      const customerName = getCustomerName(estimate, jobCardMap);
      const deviceName = getDeviceName(estimate, jobCardMap);

      const matchesSearch =
        !searchText ||
        String(estimate.id).includes(searchText) ||
        jobCardNumber.toLowerCase().includes(searchText) ||
        customerName.toLowerCase().includes(searchText) ||
        deviceName.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        estimate.approval_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [estimates, jobCardMap, search, statusFilter]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleCreateEstimate = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.job_card) {
      setError("Please select a Job Card.");
      return;
    }

    if (form.service_cost === "" || form.parts_cost === "") {
      setError("Please enter both Service Cost and Parts Cost.");
      return;
    }

    const serviceCost = Number(form.service_cost);
    const partsCost = Number(form.parts_cost);

    if (
      !Number.isFinite(serviceCost) ||
      !Number.isFinite(partsCost) ||
      serviceCost < 0 ||
      partsCost < 0
    ) {
      setError("Costs must be valid non-negative numbers.");
      return;
    }

    setSaving(true);

    try {
      await api.post("estimates/", {
        job_card: Number(form.job_card),
        service_cost: serviceCost.toFixed(2),
        parts_cost: partsCost.toFixed(2),
      });

      setSuccess(
        "Estimate created successfully and saved against the selected Job Card."
      );
      setForm(EMPTY_FORM);
      setShowForm(false);

      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Estimates
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create repair estimates and track customer approvals.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowForm((previous) => !previous);
            setError("");
            setSuccess("");
          }}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showForm ? "Close Form" : "+ Create Estimate"}
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div
          role="alert"
          className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          {success}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Estimates"
          value={estimates.length}
          color="text-slate-800"
        />
        <SummaryCard
          title="Pending Approval"
          value={pendingCount}
          color="text-amber-600"
        />
        <SummaryCard
          title="Approved"
          value={approvedCount}
          color="text-green-600"
        />
        <SummaryCard
          title="Rejected"
          value={rejectedCount}
          color="text-red-600"
        />
      </div>

      {/* Create Form */}
      {showForm && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            Create New Estimate
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a Job Card and enter the estimated costs.
          </p>

          <form
            onSubmit={handleCreateEstimate}
            className="mt-5 space-y-5"
          >
            <div>
              <label
                htmlFor="job_card"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Job Card <span className="text-red-500">*</span>
              </label>

              <select
                id="job_card"
                name="job_card"
                value={form.job_card}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a Job Card</option>

                {jobCards.map((jobCard) => (
                  <option key={jobCard.id} value={jobCard.id}>
                    {getJobCardNumber(jobCard)}
                    {jobCard.status ? ` — ${jobCard.status}` : ""}
                  </option>
                ))}
              </select>

              {jobCards.length === 0 && !loading && (
                <p className="mt-2 text-xs text-amber-700">
                  No Job Cards found. Create a Job Card first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="service_cost"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Service Cost (₹) <span className="text-red-500">*</span>
                </label>

                <input
                  id="service_cost"
                  name="service_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.service_cost}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="parts_cost"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Parts Cost (₹) <span className="text-red-500">*</span>
                </label>

                <input
                  id="parts_cost"
                  name="parts_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.parts_cost}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Automatic Total */}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm text-slate-600">
                Total Estimate Amount
              </p>
              <p className="mt-1 text-2xl font-bold text-blue-700">
                ₹{formatAmount(totalAmount)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Service Cost + Parts Cost
              </p>
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setShowForm(false);
                  setForm(EMPTY_FORM);
                  setError("");
                  setSuccess("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || jobCards.length === 0}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Estimate"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Estimates Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              Estimate Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Estimates retrieved from the backend.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 gap-3 border-b border-slate-200 p-4 sm:grid-cols-2">
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Estimate ID, Job Card, Customer or Device..."
            aria-label="Search estimates"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter estimates by approval status"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="ALL">All Approval Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 font-medium">
                  Estimate ID
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">
                  Job Card
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">
                  Customer
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">
                  Device
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">
                  Service Cost
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">
                  Parts Cost
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">
                  Total Amount
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">
                  Approval Status
                </th>
                <th className="whitespace-nowrap px-5 py-3 font-medium">
                  Created Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading estimates...
                  </td>
                </tr>
              ) : filteredEstimates.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    {estimates.length === 0
                      ? "No estimates found."
                      : "No estimates match your search or filter."}
                  </td>
                </tr>
              ) : (
                filteredEstimates.map((estimate) => (
                  <tr
                    key={estimate.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">
                     EST-{String(estimate.id).padStart(5, "0")}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span className="font-medium text-blue-700">
                        {estimate.job_card_number ||
                          getJobCardNumber(estimate.job_card)}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                      {getCustomerName(estimate, jobCardMap)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                      {getDeviceName(estimate, jobCardMap)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      ₹{formatAmount(estimate.service_cost)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      ₹{formatAmount(estimate.parts_cost)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-800">
                      ₹{formatAmount(estimate.total_amount)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(
                          estimate.approval_status
                        )}`}
                      >
                        {estimate.approval_status || "PENDING"}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      {formatDate(estimate.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
          Showing {filteredEstimates.length} of {estimates.length} estimates
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default Estimates;

