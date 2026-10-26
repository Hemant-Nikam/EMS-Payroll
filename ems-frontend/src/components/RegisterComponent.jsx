import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterComponent = ({ addToast }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Staff Member');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({ name, email, password, role });
    setIsSubmitting(false);

    if (result.success) {
      if (addToast) addToast(`Account created! Welcome, ${result.user.name}.`, 'success');
      navigate('/employees', { replace: true });
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="d-flex justify-content-center mb-3">
            <div className="brand-icon" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>
              <i className="bi bi-person-plus-fill"></i>
            </div>
          </div>
          <h3 className="fw-bold mb-1" style={{ color: '#0f172a' }}>Create an Account</h3>
          <p className="text-muted small mb-0">Join the EMS Pro Employee Portal</p>
        </div>

        <div className="auth-body">
          {error && (
            <div className="alert alert-danger py-2 px-3 d-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="custom-form-label">
                <i className="bi bi-person-fill text-primary"></i> Full Name
              </label>
              <input
                type="text"
                className="form-control custom-input"
                placeholder="e.g. Sarah Jenkins"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="custom-form-label">
                <i className="bi bi-envelope-fill text-primary"></i> Email Address
              </label>
              <input
                type="email"
                className="form-control custom-input"
                placeholder="e.g. sarah@ems.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="custom-form-label">
                <i className="bi bi-shield-check text-primary"></i> Access Role
              </label>
              <select
                className="form-select custom-input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Staff Member">Staff Member</option>
                <option value="HR Manager">HR Manager</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="custom-form-label">
                  <i className="bi bi-lock-fill text-primary"></i> Password
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control custom-input"
                    placeholder="Min 6 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                  </button>
                </div>
              </div>

              <div className="col-md-6">
                <label className="custom-form-label">
                  <i className="bi bi-shield-lock-fill text-primary"></i> Confirm
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control custom-input"
                  placeholder="Repeat pass"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary-gradient w-100 py-2 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register & Sign In</span>
                  <i className="bi bi-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4 pt-2 border-top">
            <p className="text-muted small mb-0">
              Already have an account?{' '}
              <Link to="/login" className="fw-semibold text-primary">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterComponent;
