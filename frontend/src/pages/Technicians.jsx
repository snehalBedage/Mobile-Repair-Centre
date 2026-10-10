
import { useEffect, useState } from "react";
import api from "../services/api";

const EMPTY_FORM = {
  name: "",
  mobile: "",
  email: "",
  specialization: "",
};

function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const userRole = localStorage.getItem("user_role");
  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/technicians/");
      const data = response.data;

      setTechnicians(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load technicians. Please check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingTechnician(null);
    setFormData(EMPTY_FORM);
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = (technician) => {
    setEditingTechnician(technician);

    setFormData({
      name: technician.name || "",
      mobile: technician.mobile || "",
      email: technician.email || "",
      specialization: technician.specialization || "",
    });

    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setIsModalOpen(false);
    setEditingTechnician(null);
    setFormData(EMPTY_FORM);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.mobile.trim() ||
      !formData.specialization.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      specialization: formData.specialization.trim(),
    };

    try {
      setSaving(true);

      if (editingTechnician) {
        await api.patch(
          `/technicians/${editingTechnician.id}/`,
          payload
        );
        setSuccess("Technician updated successfully.");
      } else {
        await api.post("/technicians/", payload);
        setSuccess("Technician added successfully.");
      }

      setIsModalOpen(false);
      setEditingTechnician(null);
      setFormData(EMPTY_FORM);

      await fetchTechnicians();
    } catch (err) {
      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        const firstError = Object.values(responseData).flat()[0];

        setError(
          typeof firstError === "string"
            ? firstError
            : "Unable to save technician. Please check the entered information."
        );
      } else {
        setError("Unable to save technician. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (technician) => {
    if (!isAdmin) return;

    const nextStatus =
      technician.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        nextStatus === "ACTIVE" ? "activate" : "deactivate"
      } ${technician.name}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.patch(
        `/technicians/${technician.id}/status/`,
        { status: nextStatus }
      );

      setSuccess("Technician status updated successfully.");
      await fetchTechnicians();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to update technician status. Please check your permissions."
      );
    }
  };

  const filteredTechnicians = technicians.filter((technician) => {
    const search = searchTerm.trim().toLowerCase();

    const searchableText = [
      technician.id,
      technician.name,
      technician.mobile,
      technician.email,
      technician.specialization,
      technician.status,
    ]
      .filter((value) => value !== null && value !== undefined)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search);
  });

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const requiredLabel = (label) => (
    <span className="mb-1.5 block text-sm font-medium text-slate-700">
      {label} <span className="text-red-600">*</span>
    </span>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Technicians
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage technician details and availability.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            + Add Technician
          </button>
        </div>

        {error && (
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

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="technician-search"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Search Technicians
          </label>

          <input
            id="technician-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by ID, name, mobile, email, specialization, or status..."
            className={inputClass}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading technicians...
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-slate-700">
                No technicians found.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add a technician or change your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-5 py-4 font-semibold">ID</th>
                    <th className="px-5 py-4 font-semibold">Name</th>
                    <th className="px-5 py-4 font-semibold">Mobile</th>
                    <th className="px-5 py-4 font-semibold">Email</th>
                    <th className="px-5 py-4 font-semibold">
                      Specialization
                    </th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-center font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTechnicians.map((technician) => (
                    <tr
                      key={technician.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {technician.id}
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        {technician.name}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {technician.mobile}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {technician.email || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {technician.specialization}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            technician.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {technician.status === "ACTIVE"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(technician)}
                            className="font-semibold text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleStatusToggle(technician)}
                              className={`font-semibold ${
                                technician.status === "ACTIVE"
                                  ? "text-red-600 hover:text-red-800"
                                  : "text-green-600 hover:text-green-800"
                              }`}
                            >
                              {technician.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="technician-modal-title"
            className="my-8 w-full max-w-xl rounded-xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2
                  id="technician-modal-title"
                  className="text-lg font-bold text-slate-800"
                >
                  {editingTechnician ? "Edit Technician" : "Add Technician"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the technician details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-lg px-3 py-1 text-2xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4 px-6 py-5">
                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="technician-name">
                    {requiredLabel("Full Name")}
                  </label>
                  <input
                    id="technician-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    className={inputClass}
                    maxLength={100}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="technician-mobile">
                    {requiredLabel("Mobile Number")}
                  </label>
                  <input
                    id="technician-mobile"
                    name="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    className={inputClass}
                    maxLength={20}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="technician-email"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="technician-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className={inputClass}
                    maxLength={150}
                  />
                </div>

                <div>
                  <label htmlFor="technician-specialization">
                    {requiredLabel("Specialization")}
                  </label>
                  <input
                    id="technician-specialization"
                    name="specialization"
                    type="text"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="e.g. Display Repair, Hardware, Software"
                    className={inputClass}
                    maxLength={150}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
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
                    : editingTechnician
                    ? "Update Technician"
                    : "Save Technician"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Technicians;

