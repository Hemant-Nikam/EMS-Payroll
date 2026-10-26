import React, { useState, useEffect } from 'react';
import { listEmployees } from '../service/EmployeeService';
import {
  getAttendanceByDate,
  saveAttendanceRecord,
  batchSaveAttendance,
  calculateAttendanceSummary
} from '../service/AttendanceService';
import { useAuth } from '../context/AuthContext';

const AttendanceComponent = ({ addToast }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' or 'summary'
  const [summaryMonth, setSummaryMonth] = useState(() => new Date().toISOString().slice(0, 7)); // 'YYYY-MM'

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      loadDateAttendance(selectedDate);
    }
  }, [selectedDate, employees]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await listEmployees();
      const emps = res.data || [];
      setEmployees(emps);
      loadDateAttendance(selectedDate, emps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDateAttendance = (date, empsList = employees) => {
    const existingRecords = getAttendanceByDate(date);
    const map = {};
    empsList.forEach((emp) => {
      const match = existingRecords.find((r) => String(r.employeeId) === String(emp.id));
      map[emp.id] = {
        status: match ? match.status : 'PRESENT',
        remarks: match ? match.remarks : ''
      };
    });
    setAttendanceMap(map);
  };

  const handleStatusChange = (empId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        status
      }
    }));
  };

  const handleRemarksChange = (empId, remarks) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        remarks
      }
    }));
  };

  const handleSaveAttendance = () => {
    const recordsToSave = Object.keys(attendanceMap).map((empId) => ({
      employeeId: Number(empId),
      date: selectedDate,
      status: attendanceMap[empId].status,
      remarks: attendanceMap[empId].remarks
    }));

    batchSaveAttendance(recordsToSave, user.name);
    if (addToast) addToast(`Attendance recorded for ${selectedDate}!`, 'success');
  };

  const handleMarkAll = (status) => {
    const updated = {};
    employees.forEach((emp) => {
      updated[emp.id] = {
        status,
        remarks: status === 'PRESENT' ? 'Regular' : ''
      };
    });
    setAttendanceMap(updated);
  };

  return (
    <div className="container-xl pt-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Attendance Management</h2>
          <p className="text-muted small mb-0">Record daily staff presence, track leaves, and generate period summaries</p>
        </div>
        <div className="btn-group shadow-sm">
          <button
            className={`btn ${activeTab === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('daily')}
          >
            <i className="bi bi-calendar-check me-1"></i> Daily Recording
          </button>
          <button
            className={`btn ${activeTab === 'summary' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setActiveTab('summary')}
          >
            <i className="bi bi-bar-chart-steps me-1"></i> Monthly Summaries
          </button>
        </div>
      </div>

      {activeTab === 'daily' ? (
        <div className="custom-table-card">
          {/* Controls Bar */}
          <div className="table-toolbar">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <div>
                <label className="form-label small fw-semibold text-muted mb-1">Select Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm custom-input"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="d-flex align-items-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success"
                  onClick={() => handleMarkAll('PRESENT')}
                >
                  <i className="bi bi-check-all me-1"></i> All Present
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleMarkAll('ABSENT')}
                >
                  All Absent
                </button>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary-gradient px-4"
              onClick={handleSaveAttendance}
            >
              <i className="bi bi-cloud-arrow-up-fill"></i> Save Attendance
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2"></div>
              <div className="text-muted small">Loading staff...</div>
            </div>
          ) : employees.length === 0 ? (
            <div className="empty-state-box text-center py-5">
              <h5>No employees registered</h5>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-modern align-middle">
                <thead>
                  <tr>
                    <th>Emp Code</th>
                    <th>Employee Name</th>
                    <th>Department</th>
                    <th>Attendance Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const current = attendanceMap[emp.id] || { status: 'PRESENT', remarks: '' };
                    return (
                      <tr key={emp.id}>
                        <td>
                          <span className="badge-id">{emp.employeeCode || `#${emp.id}`}</span>
                        </td>
                        <td className="fw-semibold">
                          {emp.firstName} {emp.lastName}
                        </td>
                        <td className="text-muted small">{emp.department || 'General'}</td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            {[
                              { label: 'Present', val: 'PRESENT', cls: 'btn-outline-success' },
                              { label: 'Absent', val: 'ABSENT', cls: 'btn-outline-danger' },
                              { label: 'Paid Leave', val: 'PAID_LEAVE', cls: 'btn-outline-primary' },
                              { label: 'Unpaid Leave', val: 'UNPAID_LEAVE', cls: 'btn-outline-warning' }
                            ].map((btn) => (
                              <button
                                key={btn.val}
                                type="button"
                                className={`btn btn-sm py-1 px-2 ${
                                  current.status === btn.val
                                    ? btn.val === 'PRESENT'
                                      ? 'btn-success text-white'
                                      : btn.val === 'ABSENT'
                                      ? 'btn-danger text-white'
                                      : btn.val === 'PAID_LEAVE'
                                      ? 'btn-primary text-white'
                                      : 'btn-warning text-dark'
                                    : btn.cls
                                }`}
                                onClick={() => handleStatusChange(emp.id, btn.val)}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm custom-input"
                            placeholder="Optional notes..."
                            value={current.remarks}
                            onChange={(e) => handleRemarksChange(emp.id, e.target.value)}
                            style={{ maxWidth: '200px' }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Monthly Summary Tab */
        <div className="custom-table-card">
          <div className="table-toolbar">
            <div className="d-flex align-items-center gap-3">
              <label className="fw-semibold text-muted small mb-0">Select Month:</label>
              <input
                type="month"
                className="form-control form-control-sm custom-input"
                value={summaryMonth}
                onChange={(e) => setSummaryMonth(e.target.value)}
                style={{ width: '180px' }}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-modern align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Recorded Days</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Paid Leave</th>
                  <th>Unpaid Leave</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const summary = calculateAttendanceSummary(emp.id, summaryMonth);
                  return (
                    <tr key={emp.id}>
                      <td className="fw-semibold">{emp.firstName} {emp.lastName}</td>
                      <td className="text-muted small">{emp.department || 'General'}</td>
                      <td>{summary.totalRecords}</td>
                      <td><span className="badge bg-success-subtle text-success">{summary.present}</span></td>
                      <td><span className="badge bg-danger-subtle text-danger">{summary.absent}</span></td>
                      <td><span className="badge bg-primary-subtle text-primary">{summary.paidLeave}</span></td>
                      <td><span className="badge bg-warning-subtle text-warning">{summary.unpaidLeave}</span></td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '8px', minWidth: '60px' }}>
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: `${summary.attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className="fw-bold small">{summary.attendanceRate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceComponent;
