import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ChangePasswordModal from './ChangePasswordModal';

const HeaderComponents = ({ addToast }) => {
  const { user, isAuthenticated, isAdmin, isEmployee, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (addToast) addToast('You have been signed out successfully.', 'info');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <header className="modern-navbar">
        <div className="container-xl d-flex align-items-center justify-content-between">
          {/* Brand */}
          <Link to={isAuthenticated ? (isAdmin ? "/employees" : "/employee-portal") : "/login"} className="brand-wrapper">
            <div className="brand-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="d-flex flex-column">
              <div className="d-flex align-items-center gap-2">
                <span>EMS <span style={{ color: '#06b6d4' }}>Payroll</span></span>
                <span className="brand-badge">{isAdmin ? 'Admin' : 'Employee'}</span>
              </div>
            </div>
          </Link>

          {/* Navigation Links according to Role */}
          {isAuthenticated && (
            <nav className="d-none d-lg-flex align-items-center gap-1">
              {isAdmin ? (
                <>
                  <NavLink to="/employees" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-people"></i>
                    <span>Employees</span>
                  </NavLink>
                  <NavLink to="/departments" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-diagram-3"></i>
                    <span>Departments</span>
                  </NavLink>
                  <NavLink to="/attendance" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-calendar-check"></i>
                    <span>Attendance</span>
                  </NavLink>
                  <NavLink to="/leaves" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-calendar2-range"></i>
                    <span>Leaves</span>
                  </NavLink>
                  <NavLink to="/payroll" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-cash-stack"></i>
                    <span>Payroll</span>
                  </NavLink>
                  <NavLink to="/reports" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-graph-up-arrow"></i>
                    <span>Reports</span>
                  </NavLink>
                  <NavLink to="/audit" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-shield-check"></i>
                    <span>Audit</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/employee-portal" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-speedometer2"></i>
                    <span>Dashboard</span>
                  </NavLink>
                  <NavLink to="/my-attendance" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-calendar-check"></i>
                    <span>My Attendance</span>
                  </NavLink>
                  <NavLink to="/my-leaves" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-calendar2-range"></i>
                    <span>My Leaves</span>
                  </NavLink>
                  <NavLink to="/my-payslips" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>
                    <i className="bi bi-receipt"></i>
                    <span>My Payslips</span>
                  </NavLink>
                </>
              )}
            </nav>
          )}

          {/* Right Area: Notifications, Profile Pill, Actions */}
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />

                <div className="user-profile-badge">
                  <div className="user-avatar-mini" style={{ backgroundColor: user.avatarBg || '#4f46e5' }}>
                    {getInitials(user.name)}
                  </div>
                  <div className="d-none d-sm-flex flex-column" style={{ lineHeight: 1.2 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{user.role}</span>
                  </div>

                  {/* Password Change Button */}
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-light p-0 ms-2"
                    title="Change Password"
                    onClick={() => setShowPasswordModal(true)}
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="bi bi-key fs-6"></i>
                  </button>

                  {/* Sign Out Button */}
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0 ms-2"
                    title="Sign Out"
                    onClick={handleLogout}
                    style={{ textDecoration: 'none' }}
                  >
                    <i className="bi bi-box-arrow-right fs-5"></i>
                  </button>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-light px-3 py-1 rounded-3">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Sign In
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary-gradient px-3 py-1 rounded-3">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Password Modal */}
      <ChangePasswordModal
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        addToast={addToast}
      />
    </>
  );
};

export default HeaderComponents;
