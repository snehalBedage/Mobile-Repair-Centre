import DashboardLayout from "../layouts/DashboardLayout";

function StaffDashboard() {
  return (
    <DashboardLayout role="STAFF">

      {/* Page Subtitle */}
      <div className="mb-6">
        <p className="text-sm text-slate-500">
          Overview of today's repair centre activities.
        </p>
      </div>


      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* Total Customers */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-700"></div>

          <div className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Total Customers
            </p>

            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              0
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Registered customers
            </p>
          </div>
        </div>


        {/* Active Job Cards */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-700"></div>

          <div className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Active Job Cards
            </p>

            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              0
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Currently active repairs
            </p>
          </div>
        </div>


        {/* Pending Estimates */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-700"></div>

          <div className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Pending Estimates
            </p>

            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              0
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Awaiting customer approval
            </p>
          </div>
        </div>


        {/* Low Stock Parts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-blue-700"></div>

          <div className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Low Stock Parts
            </p>

            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              0
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Parts needing attention
            </p>
          </div>
        </div>

      </div>


      {/* ================= SECOND ROW ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">

        {/* Repair Status */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="h-1 bg-blue-700"></div>

          <div className="px-5 py-4 border-b border-slate-200">

            <h3 className="text-sm font-bold text-slate-900">
              Repair Status Overview
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Current repair workflow summary
            </p>

          </div>


          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">

            {[
              ["Received", "bg-blue-500"],
              ["Diagnosis", "bg-purple-500"],
              ["Waiting Approval", "bg-orange-500"],
              ["Repair In Progress", "bg-yellow-500"],
              ["Ready for QC", "bg-cyan-500"],
              ["Completed", "bg-emerald-500"],
            ].map(([title, dotColor]) => (

              <div
                key={title}
                className="bg-slate-50 rounded-lg p-4 border border-slate-100"
              >

                <div className="flex items-center justify-between">

                  <p className="text-xs font-medium text-slate-500">
                    {title}
                  </p>

                  <span
                    className={`w-2 h-2 rounded-full ${dotColor}`}
                  ></span>

                </div>

                <p className="text-xl font-bold text-slate-900 mt-2">
                  0
                </p>

              </div>

            ))}

          </div>

        </div>


        {/* Today's Payments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="h-1 bg-blue-700"></div>

          <div className="px-5 py-4 border-b border-slate-200">

            <h3 className="text-sm font-bold text-slate-900">
              Today's Payments
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Payment summary
            </p>

          </div>


          <div className="p-5">

            <p className="text-xs font-medium text-slate-500">
              Total Collected
            </p>

            <p className="text-3xl font-bold text-slate-900 mt-2">
              ₹0
            </p>

            <div className="mt-5 pt-4 border-t border-slate-200">

              <p className="text-xs text-slate-500">
                Transactions
              </p>

              <p className="text-lg font-semibold text-slate-900 mt-2">
                0
              </p>

            </div>

          </div>

        </div>

      </div>


      {/* ================= RECENT JOB CARDS ================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-5 overflow-hidden">

        <div className="h-1 bg-blue-700"></div>

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

              <tr className="bg-slate-50 border-b border-slate-200">

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
                    className="text-left px-5 py-3 text-xs font-semibold text-slate-600"
                  >
                    {item}
                  </th>

                ))}

              </tr>

            </thead>


            <tbody>

              <tr>

                <td
                  colSpan="6"
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

            </tbody>

          </table>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default StaffDashboard;