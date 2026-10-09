

function CustomerDashboard() {
  return (
    <>

      {/* Page Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="text-sm text-slate-500 mt-1">
          Overview of your devices and repair activities.
        </p>
      </div>


      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* My Devices */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-5">

            <p className="text-sm font-medium text-slate-500">
              My Devices
            </p>

            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              0
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Registered devices
            </p>

          </div>

        </div>


        {/* Active Repairs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-5">

            <p className="text-sm font-medium text-slate-500">
              Active Repairs
            </p>

            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              0
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Currently under repair
            </p>

          </div>

        </div>


        {/* Pending Estimates */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-5">

            <p className="text-sm font-medium text-slate-500">
              Pending Estimates
            </p>

            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              0
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Awaiting your approval
            </p>

          </div>

        </div>


        {/* Completed Repairs */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-5">

            <p className="text-sm font-medium text-slate-500">
              Completed Repairs
            </p>

            <h3 className="text-3xl font-bold text-slate-900 mt-2">
              0
            </h3>

            <p className="text-xs text-slate-400 mt-1">
              Successfully completed
            </p>

          </div>

        </div>

      </div>


      {/* ================= SECOND ROW ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">

        {/* Repair Status */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-200">

            <h3 className="text-sm font-bold text-slate-900">
              Repair Status
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Current status of your repairs
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


        {/* Payment Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-200">

            <h3 className="text-sm font-bold text-slate-900">
              Payment Summary
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Your payment information
            </p>

          </div>


          <div className="p-5">

            <p className="text-xs font-medium text-slate-500">
              Total Paid
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


      {/* ================= RECENT REPAIRS ================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-5 overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-200">

          <h3 className="text-sm font-bold text-slate-900">
            My Recent Repairs
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Your latest repair activities
          </p>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead>

              <tr className="bg-slate-900 border-b border-slate-800">

                <th className="text-left px-5 py-3 text-xs font-semibold text-white">
                  Job Card
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-white">
                  Device
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-white">
                  Status
                </th>

                <th className="text-left px-5 py-3 text-xs font-semibold text-white">
                  Date
                </th>

              </tr>

            </thead>


            <tbody>

              <tr>

                <td
                  colSpan="4"
                  className="px-5 py-10 text-center"
                >

                  <p className="text-sm font-medium text-slate-500">
                    No repair records available
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Your repair information will appear here.
                  </p>

                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </>
  );
}

export default CustomerDashboard;