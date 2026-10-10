import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

const statusStyles = {
COMPLETED: "bg-green-100 text-green-700",
REPAIR_IN_PROGRESS: "bg-blue-100 text-blue-700",
QC: "bg-purple-100 text-purple-700",
RECEIVED: "bg-yellow-100 text-yellow-700",
DIAGNOSIS: "bg-orange-100 text-orange-700",
APPROVED: "bg-green-100 text-green-700",
REJECTED: "bg-red-100 text-red-700",
};

export default function TrackRepair() {
const { trackingToken } = useParams();

const [job, setJob] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
let active = true;


async function fetchTrackingDetails() {
  try {
    setLoading(true);
    setError("");

    const response = await api.get(
      `track/${encodeURIComponent(trackingToken)}/`
    );

    if (active) {
      setJob(response.data);
    }
  } catch (err) {
    if (active) {
      setError(
        err.response?.data?.detail ||
          "Tracking information could not be loaded. Please check the link."
      );
    }
  } finally {
    if (active) {
      setLoading(false);
    }
  }
}

fetchTrackingDetails();

return () => {
  active = false;
};


}, [trackingToken]);

if (loading) {
return ( <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4"> <p className="text-slate-600">Loading repair status...</p> </main>
);
}

if (error || !job) {
return ( <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4"> <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm"> <h1 className="text-xl font-bold text-slate-800">
Repair Tracking </h1> <p className="mt-3 text-sm text-red-600">
{error || "Tracking details not found."} </p> <p className="mt-3 text-sm text-slate-500">
Please verify the tracking link or contact the repair centre. </p> </div> </main>
);
}

const statusLabel = job.status_display || job.status || "Unknown";
const statusClass =
statusStyles[job.status] || "bg-slate-100 text-slate-700";

return ( <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6"> <div className="mx-auto max-w-2xl"> <header className="mb-8 text-center"> <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
📱 </div> <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
Mobile Repair Centre </h1> <p className="mt-2 text-sm text-slate-500">
Track your device repair status </p> </header>


    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <p className="text-sm text-slate-500">Job Card Number</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">
            {job.job_card_number}
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusClass}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="py-6">
        <p className="text-sm font-medium text-slate-500">
          Device Information
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-800">
          {job.device?.brand || "Unknown brand"}{" "}
          {job.device?.model || ""}
        </h3>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <p className="text-sm font-medium text-slate-500">
          Current Repair Status
        </p>
        <p className="mt-2 text-lg font-bold text-slate-900">
          {statusLabel}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Your repair status will change when the repair centre updates
          your Job Card.
        </p>
      </div>

      <div className="mt-6">
        <p className="text-sm text-slate-500">Last Updated</p>
        <p className="mt-1 text-sm font-medium text-slate-700">
          {job.last_updated
            ? new Date(job.last_updated).toLocaleString("en-IN")
            : "Not available"}
        </p>
      </div>
    </section>

    <footer className="mt-6 text-center text-xs text-slate-500">
      For assistance, please contact your repair centre.
    </footer>
  </div>
</main>


);
}
