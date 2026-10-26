import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import HeaderComponents from './components/HeaderComponents';
import FooterComponent from './components/FooterComponent';
import ListEmployeeComponent from './components/ListEmployeeComponent';
import EmployeeComponent from './components/EmployeeComponent';
import DepartmentComponent from './components/DepartmentComponent';
import AttendanceComponent from './components/AttendanceComponent';
import LeaveComponent from './components/LeaveComponent';
import PayrollComponent from './components/PayrollComponent';
import ReportsComponent from './components/ReportsComponent';
import AuditComponent from './components/AuditComponent';
import EmployeePortalComponent from './components/EmployeePortalComponent';
import LoginComponent from './components/LoginComponent';
import RegisterComponent from './components/RegisterComponent';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

// Component to handle root path redirect based on auth status and role
const RootRedirect = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/employees' : '/employee-portal'} replace />;
};

function AppContent() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <HeaderComponents addToast={addToast} />

      <main className="app-content">
        <Routes>
          {/* Root path */}
          <Route path="/" element={<RootRedirect />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginComponent addToast={addToast} />} />
          <Route path="/register" element={<RegisterComponent addToast={addToast} />} />

          {/* Admin Protected Routes */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <ListEmployeeComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-employee"
            element={
              <ProtectedRoute>
                <EmployeeComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/edit-employee/:id"
            element={
              <ProtectedRoute>
                <EmployeeComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <DepartmentComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendanceComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaves"
            element={
              <ProtectedRoute>
                <LeaveComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payroll"
            element={
              <ProtectedRoute>
                <PayrollComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit"
            element={
              <ProtectedRoute>
                <AuditComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />

          {/* Employee Self-Service Routes */}
          <Route
            path="/employee-portal"
            element={
              <ProtectedRoute>
                <EmployeePortalComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-attendance"
            element={
              <ProtectedRoute>
                <EmployeePortalComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-leaves"
            element={
              <ProtectedRoute>
                <EmployeePortalComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-payslips"
            element={
              <ProtectedRoute>
                <EmployeePortalComponent addToast={addToast} />
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </main>

      <FooterComponent />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
