import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginComponent = ({ addToast }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/employees';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (addToast) addToast(`Welcome back, ${result.user.name}! (${result.user.role})`, 'success');
      navigate(result.user.role === 'Employee' ? '/employee-portal' : from, { replace: true });
    } else {
      setError(result.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickDemo = (role) => {
    const result = demoLogin(role);
    if (result.success) {
      if (addToast) addToast(`Signed in as ${result.user.name} (${result.user.role})`, 'success');
      navigate(result.user.role === 'Employee' ? '/employee-portal' : from, { replace: true });
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="d-flex justify-content-center mb-3">
            <div className="brand-icon" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
              <i className="bi bi-people-fill"></i>
            </div>
          </div>
          <h3 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Sign In to EMS Pro</h3>
          <p className="text-muted small mb-0">Role-Based Employee Management & Payroll System</p>
        </div>

        <div className="auth-body">
          {/* Quick Demo Credentials */}
          <div className="demo-credentials-box">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="fw-semibold text-secondary" style={{ fontSize: '0.8rem' }}>
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Quick 1-Click Role Login
              </span>
              <span className="badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>Test Roles</span>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn-demo-quick flex-fill"
                onClick={() => handleQuickDemo('admin')}
              >
                <i className="bi bi-shield-lock-fill me-1 text-primary"></i> Admin Role
              </button>
              <button
                type="button"
                className="btn-demo-quick flex-fill"
                onClick={() => handleQuickDemo('employee')}
              >
                <i className="bi bi-person-badge-fill me-1 text-info"></i> Employee Role
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="custom-form-label">
                <i className="bi bi-envelope-fill text-primary"></i> Email Address
              </label>
              <input
                type="email"
                className="form-control custom-input"
                placeholder="e.g. admin@ems.com or abc@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="custom-form-label mb-0">
                  <i className="bi bi-lock-fill text-primary"></i> Password
                </label>
              </div>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control custom-input"
                  placeholder="Enter password (default: password123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  style={{ borderTopRightRadius: '10px', borderBottomRightRadius: '10px' }}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                </button>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="rememberMe" defaultChecked />
                <label className="form-check-label text-muted small" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <span className="text-muted small" style={{ fontSize: '0.8rem' }}>Default pass: password123</span>
            </div>

            <button
              type="submit"
              className="btn btn-primary-gradient w-100 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <p className="text-muted small mb-0">
              Don't have an account?{' '}
              <Link to="/register" className="fw-semibold text-primary">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
