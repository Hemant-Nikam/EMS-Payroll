import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listEmployees } from '../service/EmployeeService';
import { getEmployeeAttendance, calculateAttendanceSummary } from '../service/AttendanceService';
import { getEmployeeLeaveRequests, submitLeaveRequest } from '../service/LeaveService';
import { getEmployeePayrolls, getSalaryStructure } from '../service/PayrollService';
import PayslipModal from './PayslipModal';

const EmployeePortalComponent = ({ addToast }) => {
  const { user } = useAuth();
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'attendance', 'leaves', 'payslips'
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [salaryStructure, setSalaryStructure] = useState(null);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply Leave Form
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState('Annual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveError, setLeaveError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, [user]);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      const res = await listEmployees();
      const allEmps = res.data || [];
      // Match by email or fallback to first employee
      const match =
        allEmps.find((e) => e.email?.toLowerCase() === user.email?.toLowerCase()) ||
        allEmps[0] ||
        { id: 1, firstName: user.name, lastName: '', email: user.email, department: 'Engineering' };

      setEmployeeProfile(match);
      setAttendance(getEmployeeAttendance(match.id));
      setLeaves(getEmployeeLeaveRequests(match.id));
      setPayrolls(getEmployeePayrolls(match.id));
      setSalaryStructure(getSalaryStructure(match));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyLeave = (e) => {
    e.preventDefault();
    setLeaveError('');

    if (!startDate || !endDate) {
      setLeaveError('Please specify start and end dates.');
      return;
    }

    setIsSubmitting(true);
    const result = submitLeaveRequest({
      employeeId: employeeProfile.id,
      employeeName: `${employeeProfile.firstName} ${employeeProfile.lastName}`,
      employeeEmail: employeeProfile.email,
      leaveType,
      startDate,
      endDate,
      reason
    });
    setIsSubmitting(false);

    if (result.success) {
      if (addToast) addToast('Leave request submitted successfully!', 'success');
      setShowLeaveModal(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setLeaves(getEmployeeLeaveRequests(employeeProfile.id));
    } else {
      setLeaveError(result.message || 'Failed to submit leave.');
    }
  };

  if (loading) {
    return (
      <div className="container-xl pt-5 text-center">
        <div className="spinner-border text-primary mb-3"></div>
        <div className="text-muted small">Loading your employee portal...</div>
      </div>
    );
  }

  const attendanceSummary = employeeProfile
    ? calculateAttendanceSummary(employeeProfile.id)
    : { totalRecords: 0, present: 0, absent: 0, paidLeave: 0, unpaidLeave: 0, attendanceRate: 100 };

  return (
    <div className="container-xl pt-4 pb-5">
      {/* Welcome Banner */}
      <div className="p-4 rounded-4 text-white mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }}>
        <div>
          <span className="badge bg-white-subtle text-white border border-white-subtle mb-2 px-3 py-1">
            Employee Self-Service Portal
          </span>
          <h2 className="fw-bold mb-1">
            Welcome back, {employeeProfile?.firstName}!
          </h2>
          <div className="text-white-50 small">
            Emp Code: <strong>{employeeProfile?.employeeCode || `EMP-${employeeProfile?.id}`}</strong> &bull; Department: <strong>{employeeProfile?.department || 'General'}</strong> &bull; Designation: <strong>{employeeProfile?.designation || 'Staff'}</strong>
          </div>
        </div>

        <button
          className="btn btn-light fw-semibold text-primary px-3 py-2 rounded-3 shadow-sm"
          onClick={() => setShowLeaveModal(true)}
        >
          <i className="bi bi-calendar-plus me-1 text-primary"></i> Request Leave
        </button>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 gap-2">
        <li className="nav-item">
          <button
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-grid-fill me-1"></i> My Overview
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`btn ${activeTab === 'attendance' ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setActiveTab('attendance')}
          >
            <i className="bi bi-calendar-check me-1"></i> Attendance Log ({attendance.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`btn ${activeTab === 'leaves' ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setActiveTab('leaves')}
          >
            <i className="bi bi-calendar2-range me-1"></i> Leave Requests ({leaves.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`btn ${activeTab === 'payslips' ? 'btn-primary' : 'btn-light border'}`}
            onClick={() => setActiveTab('payslips')}
          >
            <i className="bi bi-receipt me-1"></i> My Payslips ({payrolls.length})
          </button>
        </li>
      </ul>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="row g-3">
          {/* Attendance KPI */}
          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div>
                <div className="text-muted small">Attendance Rate</div>
                <h3 className="fw-bold text-dark mb-0">{attendanceSummary.attendanceRate}%</h3>
                <div className="small text-muted mt-1">{attendanceSummary.present} Present / {attendanceSummary.totalRecords} Logged Days</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-success">
                <i className="bi bi-check-circle-fill"></i>
              </div>
            </div>
          </div>

          {/* Leaves KPI */}
          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div>
                <div className="text-muted small">Leave Requests</div>
                <h3 className="fw-bold text-dark mb-0">{leaves.length}</h3>
                <div className="small text-muted mt-1">
                  {leaves.filter((l) => l.status === 'APPROVED').length} Approved, {leaves.filter((l) => l.status === 'PENDING').length} Pending
                </div>
              </div>
              <div className="stat-icon-wrapper stat-icon-info">
                <i className="bi bi-calendar-heart"></i>
              </div>
            </div>
          </div>

          {/* Salary KPI */}
          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div>
                <div className="text-muted small">Base Monthly Salary</div>
                <h3 className="fw-bold text-dark mb-0">₹{(salaryStructure?.basicSalary || 50000).toLocaleString()}</h3>
                <div className="small text-muted mt-1">Gross: ₹{((salaryStructure?.basicSalary || 50000) + (salaryStructure?.totalAllowances || 10000)).toLocaleString()}</div>
              </div>
              <div className="stat-icon-wrapper stat-icon-primary">
                <i className="bi bi-cash-stack"></i>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="col-12 col-md-6">
            <div className="modern-card p-4 h-100">
              <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">
                <i className="bi bi-person-lines-fill text-primary me-2"></i> Employee Information
              </h5>
              <div className="row g-2 small">
                <div className="col-5 text-muted">Full Name:</div>
                <div className="col-7 fw-semibold">{employeeProfile?.firstName} {employeeProfile?.lastName}</div>

                <div className="col-5 text-muted">Official Email:</div>
                <div className="col-7">{employeeProfile?.email}</div>

                <div className="col-5 text-muted">Phone Number:</div>
                <div className="col-7">{employeeProfile?.phone || 'Not recorded'}</div>

                <div className="col-5 text-muted">Department:</div>
                <div className="col-7"><span className="badge bg-light text-dark border">{employeeProfile?.department || 'General'}</span></div>

                <div className="col-5 text-muted">Designation:</div>
                <div className="col-7 fw-semibold">{employeeProfile?.designation || 'Staff Member'}</div>

                <div className="col-5 text-muted">Joining Date:</div>
                <div className="col-7">{employeeProfile?.joiningDate || '2025-01-01'}</div>

                <div className="col-5 text-muted">Employment Status:</div>
                <div className="col-7">
                  <span className={`badge ${employeeProfile?.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                    {employeeProfile?.status || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown Card */}
          <div className="col-12 col-md-6">
            <div className="modern-card p-4 h-100">
              <h5 className="fw-bold text-dark border-bottom pb-2 mb-3">
                <i className="bi bi-currency-rupee text-success me-2"></i> Configured Salary Structure
              </h5>
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Basic Salary:</span>
                <span className="fw-semibold">₹{(salaryStructure?.basicSalary || 50000).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">HRA & Special Allowances:</span>
                <span className="fw-semibold">₹{(salaryStructure?.totalAllowances || 10000).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between small mb-2">
                <span className="text-muted">Statutory Deductions (PF/Tax):</span>
                <span className="fw-semibold text-danger">-₹{(salaryStructure?.totalDeductions || 5000).toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between border-top pt-2 mt-3 fw-bold">
                <span>Estimated Net Monthly:</span>
                <span className="text-success fs-6">
                  ₹{((salaryStructure?.basicSalary || 50000) + (salaryStructure?.totalAllowances || 10000) - (salaryStructure?.totalDeductions || 5000)).toLocaleString()}
                </span>
              </div>
              <div className="text-muted small mt-2" style={{ fontSize: '0.75rem' }}>
                * Final net payout subject to actual unpaid leaves recorded in pay cycle.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="custom-table-card">
          <div className="table-toolbar">
            <h5 className="fw-bold mb-0 text-dark">My Daily Attendance Records</h5>
            <span className="badge bg-light text-muted border">{attendance.length} days recorded</span>
          </div>

          {attendance.length === 0 ? (
            <div className="empty-state-box text-center py-5">
              <i className="bi bi-calendar-x fs-1 text-secondary mb-2 d-block"></i>
              <h6>No attendance logged yet</h6>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-modern align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Recorded By</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((rec) => (
                    <tr key={rec.id}>
                      <td className="fw-semibold">{rec.date}</td>
                      <td>
                        <span
                          className={`badge ${
                            rec.status === 'PRESENT'
                              ? 'bg-success'
                              : rec.status === 'ABSENT'
                              ? 'bg-danger'
                              : rec.status === 'PAID_LEAVE'
                              ? 'bg-primary'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="small text-muted">{rec.remarks || 'Regular'}</td>
                      <td className="small text-muted">{rec.recordedBy || 'System Admin'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Leaves Tab */}
      {activeTab === 'leaves' && (
        <div className="custom-table-card">
          <div className="table-toolbar">
            <h5 className="fw-bold mb-0 text-dark">My Leave Requests & History</h5>
            <button className="btn btn-sm btn-primary-gradient" onClick={() => setShowLeaveModal(true)}>
              <i className="bi bi-plus-lg me-1"></i> New Leave Request
            </button>
          </div>

          {leaves.length === 0 ? (
            <div className="empty-state-box text-center py-5">
              <i className="bi bi-calendar2-range fs-1 text-secondary mb-2 d-block"></i>
              <h6>No leave requests submitted</h6>
              <p className="text-muted small">Submit a request whenever you need time off.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-modern align-middle">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Leave Type</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Admin Response</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l) => (
                    <tr key={l.id}>
                      <td><span className="badge-id">#LEV-{l.id}</span></td>
                      <td className="fw-semibold">{l.leaveType}</td>
                      <td>{l.startDate} to {l.endDate}</td>
                      <td className="small text-muted" style={{ maxWidth: '220px' }}>{l.reason}</td>
                      <td>
                        <span
                          className={`badge ${
                            l.status === 'APPROVED'
                              ? 'bg-success'
                              : l.status === 'REJECTED'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {l.adminRemarks ? (
                          <span><i className="bi bi-chat-left-dots me-1"></i> {l.adminRemarks}</span>
                        ) : l.status === 'PENDING' ? (
                          'Awaiting approval'
                        ) : (
                          'No comments'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payslips Tab */}
      {activeTab === 'payslips' && (
        <div className="custom-table-card">
          <div className="table-toolbar">
            <h5 className="fw-bold mb-0 text-dark">My Monthly Payslips</h5>
            <span className="badge bg-light text-muted border">{payrolls.length} payslips</span>
          </div>

          {payrolls.length === 0 ? (
            <div className="empty-state-box text-center py-5">
              <i className="bi bi-file-earmark-spreadsheet fs-1 text-secondary mb-2 d-block"></i>
              <h6>No payslips generated yet</h6>
              <p className="text-muted small">Your monthly salary statements will appear here once processed by Payroll.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-modern align-middle">
                <thead>
                  <tr>
                    <th>Pay Period</th>
                    <th>Gross Salary</th>
                    <th>Deductions</th>
                    <th>Net Disbursed</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold">{p.payPeriodLabel}</td>
                      <td>₹{Number(p.grossSalary).toLocaleString()}</td>
                      <td className="text-danger">-₹{Number(p.totalDeductions).toLocaleString()}</td>
                      <td className="fw-bold text-success fs-6">₹{Number(p.netSalary).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${p.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSelectedPayslip(p)}
                        >
                          <i className="bi bi-printer me-1"></i> View / Print Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Leave Application Modal */}
      {showLeaveModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom">
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <h5 className="fw-bold mb-0 text-dark">Submit Leave Request</h5>
                <button type="button" className="btn-close" onClick={() => setShowLeaveModal(false)}></button>
              </div>

              {leaveError && (
                <div className="alert alert-danger py-2 px-3 small mb-3">{leaveError}</div>
              )}

              <form onSubmit={handleApplyLeave}>
                <div className="mb-3">
                  <label className="custom-form-label">Leave Type</label>
                  <select
                    className="form-select custom-input"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="Annual Leave">Annual Leave (Paid)</option>
                    <option value="Sick Leave">Sick Leave (Paid)</option>
                    <option value="Casual Leave">Casual Leave (Paid)</option>
                    <option value="Unpaid Leave">Unpaid Leave (Loss of Pay)</option>
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="custom-form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-control custom-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <label className="custom-form-label">End Date</label>
                    <input
                      type="date"
                      className="form-control custom-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="custom-form-label">Reason for Leave</label>
                  <textarea
                    rows="3"
                    className="form-control custom-input"
                    placeholder="Provide details about your planned absence..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3"
                    onClick={() => setShowLeaveModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-gradient px-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {selectedPayslip && (
        <PayslipModal
          payroll={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </div>
  );
};

export default EmployeePortalComponent;
