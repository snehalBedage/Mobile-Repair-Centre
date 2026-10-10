
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const getList = (response) => {
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.results)) return response.data.results;
  return [];
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) => {
        const message = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "string"
            ? value
            : JSON.stringify(value);

        return `${key}: ${message}`;
      })
      .join(" | ");
  }

  return error?.message || "Something went wrong.";
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getJobNumber = (jobId, jobs) => {
  const job = jobs.find((item) => Number(item.id) === Number(jobId));

  return job?.job_card_number || (job ? `#${job.id}` : `#${jobId}`);
};

const getPartName = (partId, parts) => {
  const part = parts.find((item) => Number(item.id) === Number(partId));

  return part
    ? `${part.part_name} (${part.part_code})`
    : `Part #${partId}`;
};

export default function JobParts() {
  const [jobParts, setJobParts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [spareParts, setSpareParts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    job_card: "",
    spare_part: "",
    quantity: "1",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [jobPartsResponse, jobsResponse, sparePartsResponse] =
        await Promise.all([
          api.get("job-parts/"),
          api.get("job-cards/"),
          api.get("spare-parts/"),
        ]);

      setJobParts(getList(jobPartsResponse));
      setJobs(getList(jobsResponse));
      setSpareParts(getList(sparePartsResponse));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedPart = spareParts.find(
    (part) => Number(part.id) === Number(form.spare_part)
  );

  const quantity = Number(form.quantity);
  const previewTotal =
    selectedPart && quantity > 0
      ? Number(selectedPart.unit_price || 0) * quantity
      : 0;

  const filteredJobParts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return jobParts;

    return jobParts.filter((item) => {
      const jobNumber = getJobNumber(item.job_card, jobs).toLowerCase();
      const partName = getPartName(item.spare_part, spareParts).toLowerCase();

      return (
        String(item.id).includes(term) ||
        jobNumber.includes(term) ||
        partName.includes(term)
      );
    });
  }, [jobParts, jobs, spareParts, search]);

  const totalValue = filteredJobParts.reduce(
    (sum, item) => sum + Number(item.total_price || 0),
    0
  );

  const resetForm = () => {
    setForm({
      job_card: "",
      spare_part: "",
      quantity: "1",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setError("");
    setSuccess("");
    setEditingId(item.id);

    setForm({
      job_card: String(item.job_card),
      spare_part: String(item.spare_part),
      quantity: String(item.quantity),
    });

    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const requestedQuantity = Number(form.quantity);

    if (!form.job_card) {
      setError("Please select a Job Card.");
      return;
    }

    if (!form.spare_part && !editingId) {
      setError("Please select a Spare Part.");
      return;
    }

    if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
      setError("Quantity must be a whole number greater than zero.");
      return;
    }

    if (
      !editingId &&
      selectedPart &&
      requestedQuantity > Number(selectedPart.quantity)
    ) {
      setError(
        `Only ${selectedPart.quantity} unit(s) are available in stock.`
      );
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await api.patch(`job-parts/${editingId}/`, {
          quantity: requestedQuantity,
        });

        setSuccess("Job Part quantity updated successfully.");
      } else {
        await api.post("job-parts/", {
          job_card: Number(form.job_card),
          spare_part: Number(form.spare_part),
          quantity: requestedQuantity,
        });

        setSuccess("Spare Part added to Job Card successfully.");
      }

      resetForm();
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${getPartName(
        item.spare_part,
        spareParts
      )} from Job Card ${getJobNumber(item.job_card, jobs)}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`job-parts/${item.id}/`);
      setSuccess("Job Part removed successfully. Stock has been updated.");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const getJobStatus = (jobId) => {
    const job = jobs.find((item) => Number(item.id) === Number(jobId));
    return String(job?.status || "").toUpperCase();
  };

  const isJobLocked = (jobId) => {
    const status = getJobStatus(jobId);
    return status === "COMPLETED" || status === "CANCELLED";
  };

  const availableJobs = jobs.filter(
    (job) =>
      !["COMPLETED", "CANCELLED"].includes(
        String(job.status || "").toUpperCase()
      )
  );

  const availableParts = spareParts.filter(
    (part) =>
      String(part.status || "").toUpperCase() === "ACTIVE" &&
      Number(part.quantity) > 0
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Heading */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Job Parts
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage spare parts assigned to repair job cards.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setError("");
              setSuccess("");
              setEditingId(null);
              setForm({
                job_card: "",
                spare_part: "",
                quantity: "1",
              });
              setShowForm((current) => !current);
            }}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {showForm && !editingId ? "Close Form" : "+ Add Job Part"}
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Job Part Records
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-800">
              {jobParts.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Value of Displayed Parts
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-800">
              {money(totalValue)}
            </p>
          </div>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-800">
              {editingId ? "Update Job Part Quantity" : "Add Spare Part to Job Card"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Job Card <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={form.job_card}
                    onChange={(event) =>
                      setForm({ ...form, job_card: event.target.value })
                    }
                    disabled={Boolean(editingId)}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="">Select Job Card</option>
                    {availableJobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.job_card_number || `#${job.id}`}
                        {job.status ? ` — ${job.status}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Spare Part <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={form.spare_part}
                    onChange={(event) =>
                      setForm({ ...form, spare_part: event.target.value })
                    }
                    disabled={Boolean(editingId)}
                    required={!editingId}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  >
                    <option value="">Select Spare Part</option>
                    {availableParts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.part_name} ({part.part_code}) — Stock:{" "}
                        {part.quantity} — {money(part.unit_price)}
                      </option>
                    ))}
                  </select>

                  {!editingId && availableParts.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                      No active spare parts are currently in stock.
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Quantity <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm({ ...form, quantity: event.target.value })
                    }
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              {selectedPart && !editingId && (
                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-slate-500">Available Stock</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {selectedPart.quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Unit Price</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {money(selectedPart.unit_price)}
                      </p>
                    </div>

                    <div>
                      <p className="text-slate-500">Estimated Total</p>
                      <p className="mt-1 font-semibold text-blue-700">
                        {money(previewTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving || (!editingId && availableParts.length === 0)}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Quantity"
                      : "Add Job Part"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Job Parts Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Assigned Spare Parts
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Parts currently recorded against repair jobs.
              </p>
            </div>

            <div className="w-full sm:max-w-xs">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search job card or spare part..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading job parts...
            </div>
          ) : filteredJobParts.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-slate-700">
                No Job Parts Found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Try a different search term."
                  : "Add a spare part to a Job Card to see it here."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                {/* NAVY BLUE TABLE HEADING */}
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white">
                      ID
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white">
                      Job Card
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-white">
                      Spare Part
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-white">
                      Quantity
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-white">
                      Unit Price
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-semibold text-white">
                      Total Price
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 text-center font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredJobParts.map((item) => {
                    const locked = isJobLocked(item.job_card);

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-600">
                          #{item.id}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                          {getJobNumber(item.job_card, jobs)}
                        </td>

                        <td className="min-w-48 px-4 py-4 text-slate-700">
                          {getPartName(item.spare_part, spareParts)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-slate-700">
                          {item.quantity}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right text-slate-700">
                          {money(item.unit_price)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-slate-800">
                          {money(item.total_price)}
                        </td>

                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              disabled={locked}
                              title={
                                locked
                                  ? "Completed or cancelled jobs cannot be edited."
                                  : "Edit quantity"
                              }
                              className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Edit Qty
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              disabled={locked}
                              title={
                                locked
                                  ? "Completed or cancelled jobs cannot be modified."
                                  : "Remove spare part"
                              }
                              className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredJobParts.length > 0 && (
            <div className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
              Showing {filteredJobParts.length} of {jobParts.length} records
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
