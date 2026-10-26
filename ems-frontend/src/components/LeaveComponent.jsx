import React, { useState, useEffect } from 'react';
import { getLeaveRequests, reviewLeaveRequest } from '../service/LeaveService';
import { useAuth } from '../context/AuthContext';

const LeaveComponent = ({ addToast }) => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [reviewModal, setReviewModal] = useState(null); // { leave, action: 'APPROVED' | 'REJECTED' }
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = () => {
    setLeaves(getLeaveRequests());
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewModal) return;

    setIsSubmitting(true);
    const result = reviewLeaveRequest(
      reviewModal.leave.id,
      reviewModal.action,
      remarks,
      user.name
    );
    setIsSubmitting(false);

    if (result.success) {
      if (addToast) {
        addToast(
          `Leave request #${reviewModal.leave.id} ${reviewModal.action.toLowerCase()} successfully!`,
          reviewModal.action === 'APPROVED' ? 'success' : 'info'
        );
      }
      setReviewModal(null);
      setRemarks('');
      loadLeaves();
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    if (statusFilter === 'ALL') return true;
    return l.status === statusFilter;
  });

  return (
    <div className="container-xl pt-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Leave Management</h2>
          <p className="text-muted small mb-0">Review employee time-off requests, check conflicts, and record decisions</p>
        </div>
        <div className="d-flex gap-2">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st} {st === 'PENDING' && leaves.filter((l) => l.status === 'PENDING').length > 0 && `(${leaves.filter((l) => l.status === 'PENDING').length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-table-card">
        {filteredLeaves.length === 0 ? (
          <div className="empty-state-box text-center py-5">
            <i className="bi bi-calendar2-check fs-1 text-secondary mb-2 d-block"></i>
            <h5>No leave requests found</h5>
            <p className="text-muted small">No requests match the selected status filter.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-modern align-middle">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Period</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((item) => {
                  const s = new Date(item.startDate);
                  const e = new Date(item.endDate);
                  const dayDiff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;

                  return (
                    <tr key={item.id}>
                      <td><span className="badge-id">#LEV-{item.id}</span></td>
                      <td>
                        <div className="fw-semibold text-dark">{item.employeeName}</div>
                        <div className="text-muted small">{item.employeeEmail}</div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{item.leaveType}</span>
                      </td>
                      <td className="small">
                        <div>{item.startDate} to {item.endDate}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Applied: {item.appliedDate}</div>
                      </td>
                      <td className="fw-bold">{dayDiff} {dayDiff === 1 ? 'day' : 'days'}</td>
                      <td className="small text-muted" style={{ maxWidth: '200px' }}>
                        {item.reason}
                        {item.adminRemarks && (
                          <div className="text-info mt-1" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-chat-quote me-1"></i> Admin: {item.adminRemarks}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === 'APPROVED'
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : item.status === 'REJECTED'
                              ? 'bg-danger-subtle text-danger border border-danger-subtle'
                              : 'bg-warning-subtle text-warning border border-warning-subtle'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="text-end">
                        {item.status === 'PENDING' ? (
                          <div className="d-flex justify-content-end gap-1">
                            <button
                              type="button"
                              className="btn btn-sm btn-success px-2 py-1"
                              onClick={() => setReviewModal({ leave: item, action: 'APPROVED' })}
                              title="Approve"
                            >
                              <i className="bi bi-check-lg"></i> Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger px-2 py-1"
                              onClick={() => setReviewModal({ leave: item, action: 'REJECTED' })}
                              title="Reject"
                            >
                              <i className="bi bi-x-lg"></i> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted small">
                            {item.reviewedBy ? `By ${item.reviewedBy}` : 'Processed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Review Modal */}
      {reviewModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom">
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h5 className="fw-bold mb-0 text-dark">
                  {reviewModal.action === 'APPROVED' ? 'Approve Leave Request' : 'Reject Leave Request'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setReviewModal(null)}></button>
              </div>

              <div className="alert alert-light border p-3 rounded-3 mb-3 small">
                <div><strong>Employee:</strong> {reviewModal.leave.employeeName}</div>
                <div><strong>Type:</strong> {reviewModal.leave.leaveType}</div>
                <div><strong>Dates:</strong> {reviewModal.leave.startDate} to {reviewModal.leave.endDate}</div>
                <div><strong>Reason:</strong> {reviewModal.leave.reason}</div>
              </div>

              {reviewModal.action === 'APPROVED' && (
                <div className="alert alert-info py-2 px-3 small mb-3">
                  <i className="bi bi-info-circle me-1"></i> Approving this leave will automatically mark attendance for this employee across these dates.
                </div>
              )}

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-4">
                  <label className="custom-form-label">Admin Remarks / Notes</label>
                  <textarea
                    rows="3"
                    className="form-control custom-input"
                    placeholder="Enter reason or comments for the employee..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3"
                    onClick={() => setReviewModal(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn px-4 ${reviewModal.action === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : `Confirm ${reviewModal.action}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveComponent;
