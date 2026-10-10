
import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const EMPTY_FORM = {
  part_name: "",
  part_code: "",
  quantity: "0",
  unit_price: "",
  reorder_level: "5",
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

function getErrorMessage(error, fallback) {
  const data = error.response?.data;

  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.message) return data.message;

  if (data && typeof data === "object") {
    for (const value of Object.values(data)) {
      if (Array.isArray(value) && value.length) {
        return String(value[0]);
      }

      if (typeof value === "string") return value;
    }
  }

  if (!error.response) {
    return "Backend connection failed. Please check that Django is running.";
  }

  return fallback;
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function getStockState(part) {
  const quantity = Number(part.quantity || 0);
  const reorderLevel = Number(part.reorder_level || 0);

  if (quantity === 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-50 text-red-700",
    };
  }

  if (quantity <= reorderLevel) {
    return {
      label: "Low Stock",
      className: "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "In Stock",
    className: "bg-green-50 text-green-700",
  };
}

export default function SpareParts() {
  const [parts, setParts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stockSaving, setStockSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [stockPart, setStockPart] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("1");

  const fetchParts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("spare-parts/", {
        params: search.trim() ? { search: search.trim() } : {},
      });

      const data = response.data;

      setParts(
        Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : []
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load spare parts. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const summary = useMemo(() => {
    const activeParts = parts.filter(
      (part) => part.status === "ACTIVE"
    );

    const lowStock = activeParts.filter(
      (part) =>
        Number(part.quantity) <= Number(part.reorder_level)
    );

    const totalUnits = activeParts.reduce(
      (total, part) => total + Number(part.quantity || 0),
      0
    );

    return {
      total: parts.length,
      active: activeParts.length,
      lowStock: lowStock.length,
      totalUnits,
    };
  }, [parts]);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  function openAddModal() {
    clearMessages();
    setEditingPart(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEditModal(part) {
    clearMessages();
    setEditingPart(part);

    setForm({
      part_name: part.part_name || "",
      part_code: part.part_code || "",
      quantity: String(part.quantity ?? 0),
      unit_price: String(part.unit_price ?? ""),
      reorder_level: String(part.reorder_level ?? 5),
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingPart(null);
    setForm(EMPTY_FORM);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    clearMessages();

    const quantity = Number(form.quantity);
    const unitPrice = Number(form.unit_price);
    const reorderLevel = Number(form.reorder_level);

    if (!form.part_name.trim() || !form.part_code.trim()) {
      setError("Please enter the part name and part code.");
      return;
    }

    if (
      form.quantity === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      setError("Quantity must be a whole number equal to or greater than 0.");
      return;
    }

    if (
      form.unit_price === "" ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      setError("Please enter a valid unit price.");
      return;
    }

    if (
      form.reorder_level === "" ||
      !Number.isInteger(reorderLevel) ||
      reorderLevel < 0
    ) {
      setError("Reorder level must be a whole number equal to or greater than 0.");
      return;
    }

    const payload = {
      part_name: form.part_name.trim(),
      part_code: form.part_code.trim().toUpperCase(),
      quantity,
      unit_price: unitPrice.toFixed(2),
      reorder_level: reorderLevel,
    };

    setSaving(true);

    try {
      if (editingPart) {
        await api.patch(
          `spare-parts/${editingPart.id}/`,
          payload
        );
        setSuccess("Spare part updated successfully.");
      } else {
        await api.post("spare-parts/", payload);
        setSuccess("Spare part added successfully.");
      }

      setShowModal(false);
      setEditingPart(null);
      setForm(EMPTY_FORM);

      await fetchParts();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to save spare part. Check the details and try again."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  function openStockModal(part) {
    clearMessages();
    setStockPart(part);
    setStockQuantity("1");
  }

  function closeStockModal() {
    if (stockSaving) return;

    setStockPart(null);
    setStockQuantity("1");
  }

  async function handleAddStock(event) {
    event.preventDefault();
    clearMessages();

    const quantity = Number(stockQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Enter a whole number greater than zero.");
      return;
    }

    setStockSaving(true);

    try {
      const response = await api.post(
        `spare-parts/${stockPart.id}/add-stock/`,
        { quantity }
      );

      setStockPart(null);
      setStockQuantity("1");

      const newQuantity = response.data?.new_quantity;

      setSuccess(
        `Stock added successfully${
          newQuantity !== undefined
            ? `. Available quantity: ${newQuantity}`
            : "."
        }`
      );

      await fetchParts();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to add stock. Please try again."
        )
      );
    } finally {
      setStockSaving(false);
    }
  }

  const activeParts = parts.filter(
    (part) => part.status === "ACTIVE"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Spare Parts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage spare part details, stock quantities and prices.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          + Add Spare Part
        </button>
      </div>

      {error && !showModal && !stockPart && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Parts"
          value={summary.total}
          description="Parts in the current result"
        />
        <SummaryCard
          label="Active Parts"
          value={summary.active}
          description="Available for use"
        />
        <SummaryCard
          label="Low / Out of Stock"
          value={summary.lowStock}
          description="At or below reorder level"
        />
        <SummaryCard
          label="Total Units"
          value={summary.totalUnits}
          description="Units in current result"
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="spare-part-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Search Spare Parts
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="spare-part-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by part name or part code..."
            className={inputClass}
          />

          <button
            type="button"
            onClick={fetchParts}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Searching..." : "Refresh"}
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {parts.length} part{parts.length !== 1 ? "s" : ""} returned by the API.
        </p>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-800">
              Spare Parts Inventory
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Edit details or add stock without changing existing records.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-14 text-center text-sm text-slate-500">
            Loading spare parts...
          </div>
        ) : parts.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-semibold text-slate-700">
              No spare parts found.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add a spare part or try a different search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-5 py-4 font-semibold">ID</th>
                  <th className="px-5 py-4 font-semibold">Part Details</th>
                  <th className="px-5 py-4 font-semibold">Quantity</th>
                  <th className="px-5 py-4 font-semibold">Unit Price</th>
                  <th className="px-5 py-4 font-semibold">Reorder Level</th>
                  <th className="px-5 py-4 font-semibold">Stock Status</th>
                  <th className="px-5 py-4 font-semibold">Record Status</th>
                  <th className="px-5 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {parts.map((part) => {
                  const stock = getStockState(part);

                  return (
                    <tr key={part.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-600">
                        #{part.id}
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {part.part_name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Code: {part.part_code}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {part.quantity}
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {formatCurrency(part.unit_price)}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {part.reorder_level}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stock.className}`}
                        >
                          {stock.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            part.status === "ACTIVE"
                              ? "bg-green-50 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {part.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-4">
                          <button
                            type="button"
                            onClick={() => openEditModal(part)}
                            className="font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => openStockModal(part)}
                            disabled={part.status !== "ACTIVE"}
                            className="font-semibold text-green-700 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            + Stock
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
      </section>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="spare-part-modal-title"
            className="my-auto max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2
                  id="spare-part-modal-title"
                  className="text-lg font-bold text-slate-800"
                >
                  {editingPart ? "Edit Spare Part" : "Add Spare Part"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the part details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg px-2 py-1 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="part_name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Part Name <span className="text-red-600">*</span>
                </label>
                <input
                  id="part_name"
                  name="part_name"
                  value={form.part_name}
                  onChange={handleChange}
                  maxLength={150}
                  required
                  className={inputClass}
                  placeholder="e.g. Mobile Display"
                />
              </div>

              <div>
                <label htmlFor="part_code" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Part Code <span className="text-red-600">*</span>
                </label>
                <input
                  id="part_code"
                  name="part_code"
                  value={form.part_code}
                  onChange={handleChange}
                  maxLength={50}
                  required
                  className={inputClass}
                  placeholder="e.g. DSP-001"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Part code must be unique.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Initial Quantity <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={form.quantity}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Use + Stock to increase quantity later.
                  </p>
                </div>

                <div>
                  <label htmlFor="unit_price" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Unit Price (₹) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="unit_price"
                    name="unit_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.unit_price}
                    onChange={handleChange}
                    required
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reorder_level" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Reorder Level <span className="text-red-600">*</span>
                </label>
                <input
                  id="reorder_level"
                  name="reorder_level"
                  type="number"
                  min="0"
                  step="1"
                  value={form.reorder_level}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-slate-500">
                  Low-stock warning appears when quantity is at or below this level.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingPart
                      ? "Save Changes"
                      : "Add Spare Part"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {stockPart && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeStockModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-stock-title"
            className="my-auto w-full max-w-md rounded-xl bg-white shadow-xl"
          >
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 id="add-stock-title" className="text-lg font-bold text-slate-800">
                Add Stock
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {stockPart.part_name} ({stockPart.part_code})
              </p>
            </div>

            <form onSubmit={handleAddStock} className="space-y-5 p-6">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current stock</p>
                <p className="mt-1 text-xl font-bold text-slate-800">
                  {stockPart.quantity} units
                </p>
              </div>

              <div>
                <label htmlFor="stock-quantity" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Quantity to Add <span className="text-red-600">*</span>
                </label>
                <input
                  id="stock-quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={stockQuantity}
                  onChange={(event) => setStockQuantity(event.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeStockModal}
                  disabled={stockSaving}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={stockSaving}
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {stockSaving ? "Adding..." : "Confirm Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, description }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}
