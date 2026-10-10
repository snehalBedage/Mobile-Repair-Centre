
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  job_card: "",
  start_date: new Date().toISOString().slice(0, 10),
  end_date: "",
  warranty_terms: "",
};

const statusStyles = {
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRED: "bg-amber-100 text-amber-700",
  VOID: "bg-red-100 text-red-700",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(err) {
  const data = err.response?.data;

  if (data?.detail) return data.detail;

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([key, value]) =>
        `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
      )
      .join(" | ");
  }

  return "काहीतरी चूक झाली. पुन्हा प्रयत्न करा.";
}

export default function Warranties() {
  const [warranties, setWarranties] = useState([]);
  const [jobCards, setJobCards] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedWarranty, setSelectedWarranty] = useState(null);

  const role = (
    localStorage.getItem("user_role") || ""
  ).toUpperCase();

  const canManage = role === "ADMIN" || role === "STAFF";
  const isAdmin = role === "ADMIN";

  const loadWarranties = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("warranties/", {
        params: {
          page,
          ...(search ? { search } : {}),
        },
      });

      const data = response.data;

      setWarranties(Array.isArray(data) ? data : data.results || []);
      setNextPage(Array.isArray(data) ? null : data.next || null);
      setPreviousPage(
        Array.isArray(data) ? null : data.previous || null
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const loadJobCards = useCallback(async () => {
    if (!canManage) return;

    try {
      const response = await api.get("job-cards/");
      const data = response.data;
      const items = Array.isArray(data) ? data : data.results || [];

      setJobCards(
        items.filter((job) => job.status === "COMPLETED")
      );
    } catch {
      setJobCards([]);
    }
  }, [canManage]);

  useEffect(() => {
    loadWarranties();
  }, [loadWarranties]);

  useEffect(() => {
    loadJobCards();
  }, [loadJobCards]);

  function openForm() {
    setForm(emptyForm);
    setError("");
    setMessage("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!form.job_card || !form.start_date || !form.end_date) {
      setError("सर्व आवश्यक fields भरा.");
      return;
    }

    if (form.end_date < form.start_date) {
      setError("End Date ही Start Date च्या आधी असू शकत नाही.");
      return;
    }

    if (!form.warranty_terms.trim()) {
      setError("Warranty Terms लिहा.");
      return;
    }

    setSaving(true);

    try {
      await api.post("warranties/", {
        job_card: Number(form.job_card),
        start_date: form.start_date,
        end_date: form.end_date,
        warranty_terms: form.warranty_terms.trim(),
      });

      closeForm();
      setPage(1);
      setSearch("");
      setSearchInput("");
      setMessage("Warranty created successfylly.");

      await loadJobCards();

      const response = await api.get("warranties/");
      const data = response.data;
      setWarranties(Array.isArray(data) ? data : data.results || []);
      setNextPage(Array.isArray(data) ? null : data.next || null);
      setPreviousPage(
        Array.isArray(data) ? null : data.previous || null
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(warranty, newStatus) {
    setError("");
    setMessage("");

    try {
      await api.patch(`warranties/${warranty.id}/status/`, {
        status: newStatus,
      });

      setMessage("Warranty status update झाला.");
      await loadWarranties();

      if (selectedWarranty?.id === warranty.id) {
        setSelectedWarranty({ ...warranty, status: newStatus });
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Warranties
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage repair warranties and validity.
            </p>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={openForm}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <span className="text-lg leading-none">+</span>
              Add Warranty
            </button>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
          >
            {message}
          </div>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Warranty Records
              </h2>
              <p className="text-sm text-slate-500">
                View and search warranty details.
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search warranties..."
                className="w-full min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-64"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-slate-500">
              Loading warranties...
            </p>
          ) : warranties.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No warranty records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Warranty ID</th>
                    <th className="px-4 py-3 font-semibold">Job Card ID</th>
                    <th className="px-4 py-3 font-semibold">Start Date</th>
                    <th className="px-4 py-3 font-semibold">End Date</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {warranties.map((warranty) => (
                    <tr key={warranty.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {warranty.warranty_number || `#${warranty.id}`}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {warranty.job_card}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(warranty.start_date)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(warranty.end_date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            statusStyles[warranty.status] ||
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {warranty.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedWarranty(warranty)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>

                          {isAdmin && (
                            <select
                              aria-label={`Update status for ${warranty.warranty_number}`}
                              value={warranty.status}
                              onChange={(e) =>
                                handleStatusChange(warranty, e.target.value)
                              }
                              className="rounded-md border border-slate-300 px-2 py-1.5 text-xs"
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="EXPIRED">Expired</option>
                              <option value="VOID">Void</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 p-4">
            <button
              type="button"
              disabled={!previousPage || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-slate-500">Page {page}</span>

            <button
              type="button"
              disabled={!nextPage || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </section>

        {formOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
            onClick={closeForm}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-warranty-title"
              className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200 p-5">
                <div>
                  <h2
                    id="add-warranty-title"
                    className="text-lg font-bold text-slate-800"
                  >
                    Add Warranty
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Enter the completed job card and warranty details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  aria-label="Close form"
                  className="rounded-lg px-3 py-1 text-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-5">
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Completed Job Card *
                  </label>
                  <select
                    required
                    value={form.job_card}
                    onChange={(e) =>
                      setForm({ ...form, job_card: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select Job Card</option>
                    {jobCards.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.job_card_number || `Job Card #${job.id}`}
                      </option>
                    ))}
                  </select>
                  {jobCards.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      Completed Job Card is not available or not loaded
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={form.start_date}
                      onChange={(e) =>
                        setForm({ ...form, start_date: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={form.start_date}
                      value={form.end_date}
                      onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Warranty Terms *
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={2000}
                    value={form.warranty_terms}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        warranty_terms: e.target.value,
                      })
                    }
                    placeholder="Enter warranty coverage and conditions..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving || jobCards.length === 0}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Create Warranty"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {selectedWarranty && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
            onClick={() => setSelectedWarranty(null)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="warranty-detail-title"
              className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2
                  id="warranty-detail-title"
                  className="text-xl font-bold text-slate-800"
                >
                  Warranty Details
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedWarranty(null)}
                  aria-label="Close details"
                  className="text-2xl text-slate-500 hover:text-slate-800"
                >
                  ×
                </button>
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Warranty Number</dt>
                  <dd className="font-semibold text-slate-800">
                    {selectedWarranty.warranty_number}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Job Card ID</dt>
                  <dd className="font-medium text-slate-800">
                    {selectedWarranty.job_card}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Start Date</dt>
                  <dd className="font-medium text-slate-800">
                    {formatDate(selectedWarranty.start_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">End Date</dt>
                  <dd className="font-medium text-slate-800">
                    {formatDate(selectedWarranty.end_date)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Status</dt>
                  <dd className="font-medium text-slate-800">
                    {selectedWarranty.status}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Warranty Terms</dt>
                  <dd className="whitespace-pre-wrap text-slate-700">
                    {selectedWarranty.warranty_terms}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => setSelectedWarranty(null)}
                className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
