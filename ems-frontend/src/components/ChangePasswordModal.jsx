import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ChangePasswordModal = ({ show, onClose, addToast }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { changePassword } = useAuth();

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      if (addToast) addToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } else {
      setError(result.message || 'Failed to update password.');
    }
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom">
        <div className="p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', background: '#e0e7ff', color: '#4f46e5' }}
              >
                <i className="bi bi-shield-lock-fill fs-5"></i>
              </div>
              <h5 className="fw-bold mb-0 text-dark">Change Password</h5>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small mb-3">
              <i className="bi bi-exclamation-triangle-fill me-1"></i> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="custom-form-label">Current Password</label>
              <input
                type="password"
                className="form-control custom-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="custom-form-label">New Password</label>
              <input
                type="password"
                className="form-control custom-input"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="custom-form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control custom-input"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-outline-secondary px-3" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary-gradient px-4" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
