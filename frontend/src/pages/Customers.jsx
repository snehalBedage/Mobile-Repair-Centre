
import { useEffect, useState } from "react";
import api from "../services/api";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const emptyForm = {
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirm_password: "",
    address: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const [editData, setEditData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    status: "ACTIVE",
  });

  // LOAD CUSTOMERS
  const fetchCustomers = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers/", {
        params: searchValue ? { search: searchValue } : {},
      });

      if (Array.isArray(response.data)) {
        setCustomers(response.data);
      } else {
        setCustomers(response.data.results || []);
      }
    } catch (err) {
      console.error("Customer fetch error:", err);
      setError(
        err.response?.data?.detail || "Unable to load customers."
      );
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // SEARCH CUSTOMERS
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ADD FORM INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // EDIT FORM INPUT
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // OPEN ADD FORM
  const openAddForm = () => {
    setError("");
    setSuccess("");
    setFormData({ ...emptyForm });
    setShowAddForm(true);
  };

  // CLOSE ADD FORM
  const closeAddForm = () => {
    if (saving) return;
    setShowAddForm(false);
    setFormData({ ...emptyForm });
  };

  // CREATE CUSTOMER
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.name.trim() ||
      !formData.mobile.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirm_password
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSaving(true);

      await api.post("/auth/register/", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        mobile: formData.mobile.trim(),
        address: formData.address.trim(),
      });

      setSuccess("Customer created successfully.");
      setShowAddForm(false);
      setFormData({ ...emptyForm });

      await fetchCustomers(search.trim());
    } catch (err) {
      console.error("Customer create error:", err);
      const data = err.response?.data;

      if (data?.email) {
        setError(Array.isArray(data.email) ? data.email[0] : data.email);
      } else if (data?.confirm_password) {
        setError(
          Array.isArray(data.confirm_password)
            ? data.confirm_password[0]
            : data.confirm_password
        );
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError("Unable to create customer.");
      }
    } finally {
      setSaving(false);
    }
  };

  // OPEN EDIT FORM
  const openEditForm = (customer) => {
    setError("");
    setSuccess("");
    setSelectedCustomer(customer);

    setEditData({
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      address: customer.address || "",
      status: customer.status || "ACTIVE",
    });

    setShowEditForm(true);
  };

  // CLOSE EDIT FORM
  const closeEditForm = () => {
    if (saving) return;
    setShowEditForm(false);
    setSelectedCustomer(null);
  };

  // UPDATE CUSTOMER INCLUDING STATUS
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) return;

    setError("");
    setSuccess("");

    if (
      !editData.name.trim() ||
      !editData.mobile.trim() ||
      !editData.email.trim()
    ) {
      setError("Name, mobile and email are required.");
      return;
    }

    try {
      setSaving(true);

      await api.patch(`/customers/${selectedCustomer.id}/`, {
        name: editData.name.trim(),
        mobile: editData.mobile.trim(),
        email: editData.email.trim(),
        address: editData.address.trim(),
        status: editData.status,
      });

      setShowEditForm(false);
      setSelectedCustomer(null);
      setSuccess("Customer details and status updated successfully.");

      await fetchCustomers(search.trim());
    } catch (err) {
      console.error("Customer update error:", err);
      const data = err.response?.data;

      if (data?.email) {
        setError(Array.isArray(data.email) ? data.email[0] : data.email);
      } else if (data?.mobile) {
        setError(Array.isArray(data.mobile) ? data.mobile[0] : data.mobile);
      } else if (data?.status) {
        setError(Array.isArray(data.status) ? data.status[0] : data.status);
      } else if (data?.detail) {
        setError(data.detail);
      } else {
        setError("Unable to update customer.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer profiles and their information.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          + Add Customer
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* SEARCH */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, mobile or email..."
            className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          <p className="text-sm text-slate-500">
            {customers.length} customer{customers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* CUSTOMER TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead className="bg-slate-900">
              <tr>
                {[
                  "Customer Code",
                  "Customer",
                  "Mobile",
                  "Email",
                  "Address",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3 text-left text-xs font-semibold text-white"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    {search ? "No customers found." : "No customer data available."}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4 text-sm font-semibold text-blue-600">
                      {customer.customer_code}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-800">
                      {customer.name}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {customer.mobile}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {customer.email}
                    </td>

                    <td className="max-w-[220px] px-5 py-4 text-sm text-slate-600">
                      <div className="truncate">
                        {customer.address || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          customer.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {customer.status || "UNKNOWN"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => openEditForm(customer)}
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-500 hover:text-blue-600"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <form onSubmit={handleCreateCustomer}>
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Add Customer
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Create a new customer account.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeAddForm}
                  className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter customer name"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Mobile *
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    placeholder="Enter mobile number"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email address"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create password"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    placeholder="Confirm password"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Address
                  </label>
                  <textarea
                    rows="3"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter customer address"
                    className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeAddForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {showEditForm && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <form onSubmit={handleUpdateCustomer}>
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    Edit Customer
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Customer Code: {selectedCustomer.customer_code}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditForm}
                  className="text-2xl leading-none text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 px-6 py-6 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Mobile
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={editData.mobile}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleEditChange}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Address
                  </label>
                  <textarea
                    rows="3"
                    name="address"
                    value={editData.address}
                    onChange={handleEditChange}
                    className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* CUSTOMER STATUS */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Customer Status
                  </label>

                  <select
                    name="status"
                    value={editData.status}
                    onChange={handleEditChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>

                  <p className="mt-1.5 text-xs text-slate-500">
                    Select whether this customer profile is active or inactive.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={closeEditForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;