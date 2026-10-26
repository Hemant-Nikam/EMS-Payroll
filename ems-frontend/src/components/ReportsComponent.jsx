import React, { useState, useEffect } from 'react';
import { listEmployees } from '../service/EmployeeService';
import { listDepartments } from '../service/DepartmentService';
import { getPayrollRecords } from '../service/PayrollService';
import { getAttendanceRecords } from '../service/AttendanceService';

const ReportsComponent = ({ addToast }) => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reportType, setReportType] = useState('payroll'); // 'payroll', 'attendance', 'demographics'
  const [filterDept, setFilterDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([listEmployees(), listDepartments()]);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
      setPayrolls(getPayrollRecords());
      setAttendance(getAttendanceRecords());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const activeCount = employees.filter((e) => (e.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  const inactiveCount = employees.length - activeCount;

  // Department counts
  const deptCounts = departments.map((d) => {
    const count = employees.filter(
      (e) => e.department && e.department.toLowerCase() === d.departmentName.toLowerCase()
    ).length;
    return { name: d.departmentName, code: d.departmentCode, count };
  });

  // Payroll Metrics
  const totalGross = payrolls.reduce((sum, p) => sum + (Number(p.grossSalary) || 0), 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + (Number(p.totalDeductions) || 0), 0);
  const totalNet = payrolls.reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);

  // Filtered Payrolls
  const filteredPayrolls = payrolls.filter((p) => {
    const matchDept = filterDept === 'ALL' || (p.department && p.department.toLowerCase() === filterDept.toLowerCase());
    const matchSearch =
      !searchQuery ||
      p.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.payPeriodLabel?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDept && matchSearch;
  });

  // Export to CSV Function
  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      if (addToast) addToast('No data available to export.', 'warning');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((fieldName) => {
            const val = row[fieldName] !== undefined && row[fieldName] !== null ? String(row[fieldName]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (addToast) addToast(`Exported ${filename}.csv successfully!`, 'success');
  };

  const handleExportPayroll = () => {
    const formatted = filteredPayrolls.map((p) => ({
      PayslipId: p.id,
      EmployeeCode: p.employeeCode,
      EmployeeName: p.employeeName,
      Department: p.department,
      PayPeriod: p.payPeriodLabel,
      BasicSalary: p.basicSalary,
      Allowances: p.allowances,
      GrossSalary: p.grossSalary,
      UnpaidDeduction: p.unpaidDeduction,
      TotalDeductions: p.totalDeductions,
      NetSalary: p.netSalary,
      Status: p.status,
      GeneratedDate: p.generatedDate,
      PaymentDate: p.paymentDate || 'Pending'
    }));
    exportToCSV(formatted, 'Payroll_Expenditure_Report');
  };

  const handleExportEmployees = () => {
    const formatted = employees.map((e) => ({
      Id: e.id,
      Code: e.employeeCode || `EMP-${e.id}`,
      FirstName: e.firstName,
      LastName: e.lastName,
      Email: e.email,
      Phone: e.phone || '',
      Department: e.department || 'General',
      Designation: e.designation || 'Staff',
      Status: e.status || 'ACTIVE',
      JoiningDate: e.joiningDate || ''
    }));
    exportToCSV(formatted, 'Employee_Directory_Report');
  };

  const handleExportAttendance = () => {
    const formatted = attendance.map((a) => ({
      RecordId: a.id,
      EmployeeId: a.employeeId,
      Date: a.date,
      Status: a.status,
      Remarks: a.remarks || '',
      RecordedBy: a.recordedBy || 'Admin'
    }));
    exportToCSV(formatted, 'Attendance_Summary_Report');
  };

  return (
    <div className="container-xl pt-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Reports & Analytics</h2>
          <p className="text-muted small mb-0">Aggregate organizational headcount, payroll expenditures, and staff metrics</p>
        </div>
        <div className="btn-group">
          <button
            className={`btn ${reportType === 'payroll' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setReportType('payroll')}
          >
            <i className="bi bi-cash-stack me-1"></i> Payroll Reports
          </button>
          <button
            className={`btn ${reportType === 'demographics' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setReportType('demographics')}
          >
            <i className="bi bi-people-fill me-1"></i> Headcount & Depts
          </button>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small">Active Employees</div>
              <h3 className="fw-bold text-success mb-0">{activeCount}</h3>
              <div className="text-muted small">{inactiveCount} inactive / separated</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-success">
              <i className="bi bi-person-check-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small">Departments</div>
              <h3 className="fw-bold text-dark mb-0">{departments.length}</h3>
              <div className="text-muted small">Organizational units</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-info">
              <i className="bi bi-diagram-3-fill"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small">Total Payroll Disbursed</div>
              <h3 className="fw-bold text-primary mb-0">₹{totalNet.toLocaleString()}</h3>
              <div className="text-muted small">{payrolls.length} processed payslips</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-primary">
              <i className="bi bi-cash-coin"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-3">
          <div className="stat-card">
            <div>
              <div className="text-muted small">Total Statutory & Penalties</div>
              <h3 className="fw-bold text-danger mb-0">₹{totalDeductions.toLocaleString()}</h3>
              <div className="text-muted small">Deductions recorded</div>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <i className="bi bi-pie-chart-fill"></i>
            </div>
          </div>
        </div>
      </div>

      {reportType === 'payroll' ? (
        /* Payroll Report View */
        <div className="custom-table-card">
          <div className="table-toolbar">
            <div className="d-flex align-items-center gap-3 flex-wrap flex-grow-1">
              <div className="search-box-wrapper" style={{ maxWidth: '320px' }}>
                <i className="bi bi-search search-icon"></i>
                <input
                  type="text"
                  className="form-control search-input"
                  placeholder="Filter by name, code, month..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div>
                <select
                  className="form-select form-select-sm custom-input"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  style={{ minWidth: '160px' }}
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.departmentName}>{d.departmentName}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="btn btn-outline-success btn-sm px-3" onClick={handleExportPayroll}>
              <i className="bi bi-file-earmark-arrow-down-fill me-1"></i> Export Payroll (CSV)
            </button>
          </div>

          <div className="table-responsive">
            <table className="table table-modern align-middle">
              <thead>
                <tr>
                  <th>Slip ID</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Pay Period</th>
                  <th>Gross Salary</th>
                  <th>Total Deductions</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No payroll records match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredPayrolls.map((p) => (
                    <tr key={p.id}>
                      <td><span className="badge-id">#{p.id}</span></td>
                      <td className="fw-semibold">{p.employeeName}</td>
                      <td><span className="badge bg-light text-dark border">{p.department}</span></td>
                      <td>{p.payPeriodLabel}</td>
                      <td>₹{Number(p.grossSalary).toLocaleString()}</td>
                      <td className="text-danger">-₹{Number(p.totalDeductions).toLocaleString()}</td>
                      <td className="fw-bold text-success">₹{Number(p.netSalary).toLocaleString()}</td>
                      <td>
                        <span className={`badge ${p.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Headcount & Departments Breakdown */
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <div className="custom-table-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark">Staff Distribution by Department</h5>
                <button className="btn btn-sm btn-outline-primary" onClick={handleExportEmployees}>
                  <i className="bi bi-download me-1"></i> Export Staff (CSV)
                </button>
              </div>

              {deptCounts.map((d) => {
                const pct = employees.length > 0 ? Math.round((d.count / employees.length) * 100) : 0;
                return (
                  <div key={d.code} className="mb-3">
                    <div className="d-flex justify-content-between small fw-semibold mb-1">
                      <span>{d.name} ({d.code})</span>
                      <span>{d.count} ({pct}%)</span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-primary"
                        role="progressbar"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-12 col-md-6">
            <div className="custom-table-card p-4 h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark">Attendance Records Export</h5>
                <button className="btn btn-sm btn-outline-success" onClick={handleExportAttendance}>
                  <i className="bi bi-file-earmark-arrow-down-fill me-1"></i> Export Attendance (CSV)
                </button>
              </div>
              <p className="text-muted small">
                Download the complete raw attendance log comprising daily presence, leaves, absences, and administrator audit notes.
              </p>
              <div className="alert alert-light border small">
                <div><strong>Total Logs in Database:</strong> {attendance.length} records</div>
                <div><strong>Active Monitored Staff:</strong> {activeCount} employees</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsComponent;
