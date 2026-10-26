import React from 'react';

const Toast = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container-custom">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type || 'info'}`}>
          <div className="d-flex align-items-center gap-2">
            {toast.type === 'success' && <i className="bi bi-check-circle-fill text-success fs-5"></i>}
            {toast.type === 'danger' && <i className="bi bi-exclamation-triangle-fill text-danger fs-5"></i>}
            {toast.type === 'warning' && <i className="bi bi-exclamation-circle-fill text-warning fs-5"></i>}
            {(!toast.type || toast.type === 'info') && <i className="bi bi-info-circle-fill text-info fs-5"></i>}
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{toast.message}</span>
          </div>
          <button
            type="button"
            className="btn-close btn-close-white ms-2"
            style={{ fontSize: '0.75rem' }}
            onClick={() => removeToast(toast.id)}
            aria-label="Close"
          ></button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
