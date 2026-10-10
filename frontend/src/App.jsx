
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

import Customers from "./pages/Customers";
import Devices from "./pages/Devices";
import Technicians from "./pages/Technicians";
import JobCards from "./pages/JobCards";
import JobCardDetail from "./pages/JobCardDetail";
import TrackRepair from "./pages/TrackRepair";
import Estimates from "./pages/Estimates";
import SpareParts from "./pages/SpareParts";
import JobParts from "./pages/JobParts";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleLayout from "./layouts/RoleLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================= */}
        {/* PUBLIC PAGES */}
        {/* ============================= */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Registration />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:uid/:token/"
          element={<ResetPassword />}
        />

        {/* PUBLIC REPAIR TRACKING */}
        <Route
          path="/track/:trackingToken"
          element={<TrackRepair />}
        />

        {/* ============================= */}
        {/* ADMIN AND STAFF LAYOUT */}
        {/* ============================= */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          {/* ADMIN DASHBOARD */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* STAFF DASHBOARD */}
          <Route
            path="/staff-dashboard"
            element={
              <ProtectedRoute allowedRoles={["STAFF"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          {/* CUSTOMERS */}
          <Route
            path="/customers"
            element={<Customers />}
          />

          {/* DEVICES */}
          <Route
            path="/devices"
            element={<Devices />}
          />

          {/* TECHNICIANS */}
          <Route
            path="/technicians"
            element={<Technicians />}
          />

          {/* JOB CARDS LIST */}
          <Route
            path="/job-cards"
            element={<JobCards />}
          />

          {/* JOB CARD DETAILS */}
          <Route
            path="/job-cards/:id"
            element={<JobCardDetail />}
          />

          {/* ESTIMATES */}
          <Route
            path="/estimates"
            element={<Estimates />}
          />

          {/* SPARE PARTS */}
          <Route
            path="/spare-parts"
            element={<SpareParts />}
          />
          {/* JOB PARTS */}
<Route
  path="/job-parts"
  element={<JobParts />}
/>
        </Route>

        {/* ============================= */}
        {/* CUSTOMER LAYOUT */}
        {/* ============================= */}

        <Route
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <RoleLayout />
            </ProtectedRoute>
          }
        >
          {/* CUSTOMER DASHBOARD */}
          <Route
            path="/customer-dashboard"
            element={<CustomerDashboard />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
