import React, { useState, useEffect } from 'react';
import { listEmployees } from '../service/EmployeeService';
import {
  getPayrollRecords,
  generatePayroll,
  generateBatchPayroll,
  updatePayrollStatus,
  getSalaryStructure,
  saveSalaryStructure
} from '../service/PayrollService';
import { useAuth } from '../context/AuthContext';
import PayslipModal from './PayslipModal';

const PayrollComponent = ({ addToast }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Salary Configuration Modal
  const [configEmployee, setConfigEmployee] = useState(null);
  const [basicSalary, setBasicSalary] = useState('');
  const [allowances, setAllowances] = useState('');
  const [deductions, setDeductions] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listEmployees();
      setEmployees(res.data || []);
      setPayrolls(getPayrollRecords());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSingle = (emp) => {
    const res = generatePayroll(emp, selectedMonth, user.name);
    if (res.success) {
      if (addToast) addToast(`Payroll generated for ${emp.firstName} ${emp.lastName}!`, 'success');
      setPayrolls(getPayrollRecords());
    } else {
      if (addToast) addToast(res.message, 'warning');
    }
  };

  const handleGenerateBatch = () => {
    const res = generateBatchPayroll(employees, selectedMonth, user.name);
    if (res.generated > 0) {
      if (addToast) {
        addToast(
          `Generated ${res.generated} payroll records for ${selectedMonth}. (${res.skipped} skipped)`,
          'success'
        );
      }
      setPayrolls(getPayrollRecords());
    } else {
      if (addToast) {
        addToast(`No new payrolls generated. All records for ${selectedMonth} already exist!`, 'info');
      }
    }
  };

  const handleMarkPaid = (payrollId) => {
    updatePayrollStatus(payrollId, 'PAID', user.name);
    if (addToast) addToast(`Payroll ${payrollId} marked as PAID.`, 'success');
    setPayrolls(getPayrollRecords());
  };

  const openConfigModal = (emp) => {
    const struct = getSalaryStructure(emp);
    setConfigEmployee(emp);
    setBasicSalary(struct.basicSalary);
    setAllowances(struct.totalAllowances);
    setDeductions(struct.totalDeductions);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!configEmployee) return;

    const b = Number(basicSalary) || 0;
    const a = Number(allowances) || 0;
    const d = Number(deductions) || 0;

    const newStruct = {
      employeeId: configEmployee.id,
      basicSalary: b,
      hra: Math.round(a * 0.5),
      specialAllowance: Math.round(a * 0.3),
      conveyance: Math.round(a * 0.2),
      totalAllowances: a,
      providentFund: Math.round(d * 0.6),
      professionalTax: 200,
      healthInsurance: Math.max(0, Math.round(d * 0.4) - 200),
      totalDeductions: d
    };

    saveSalaryStructure(configEmployee.id, newStruct, user.name);
    if (addToast) addToast(`Salary structure updated for ${configEmployee.firstName}!`, 'success');
    setConfigEmployee(null);
  };

  // Filter payrolls for selected month
  const monthPayrolls = payrolls.filter((p) => p.payPeriod === selectedMonth);

  // Summary Metrics
  const totalGross = monthPayrolls.reduce((sum, p) => sum + (Number(p.grossSalary) || 0), 0);
  const totalDeductions = monthPayrolls.reduce((sum, p) => sum + (Number(p.totalDeductions) || 0), 0);
  const totalNet = monthPayrolls.reduce((sum, p) => sum + (Number(p.netSalary) || 0), 0);

  return (
    <div className="container-xl pt-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Payroll Management</h2>
          <p className="text-muted small mb-0">Configure salary structures, deduct unpaid leaves, and process monthly payslips</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <label className="small fw-semibold text-muted mb-0">Pay Period:</label>
            <input
              type="month"
              className="form-control form-control-sm custom-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: '160px' }}
            />
          </div>
          <button className="btn btn-primary-gradient" onClick={handleGenerateBatch}>
            <i className="bi bi-play-circle-fill"></i> Run All Payroll
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small">Total Gross Salary</div>
              <h3 className="fw-bold text-dark mb-0">₹{totalGross.toLocaleString()}</h3>
              <div className="small text-muted mt-1">{monthPayrolls.length} payslips in period</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-primary">
              <i className="bi bi-wallet2"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small">Total Deductions (PF/Tax/Unpaid)</div>
              <h3 className="fw-bold text-danger mb-0">₹{totalDeductions.toLocaleString()}</h3>
              <div className="small text-muted mt-1">Includes attendance penalties</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-danger" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <i className="bi bi-dash-circle"></i>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="stat-card">
            <div>
              <div className="text-muted small">Net Payroll Expenditure</div>
              <h3 className="fw-bold text-success mb-0">₹{totalNet.toLocaleString()}</h3>
              <div className="small text-muted mt-1">Disbursable to staff</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-success">
              <i className="bi bi-cash-coin"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="custom-table-card mb-4">
        <div className="table-toolbar">
          <h5 className="fw-bold mb-0 text-dark">
            Generated Payslips ({selectedMonth})
          </h5>
          <span className="badge bg-light text-dark border">
            {monthPayrolls.length} records generated
          </span>
        </div>

        {monthPayrolls.length === 0 ? (
          <div className="empty-state-box text-center py-5">
            <i className="bi bi-receipt fs-1 text-secondary mb-2 d-block"></i>
            <h5>No payroll generated for {selectedMonth}</h5>
            <p className="text-muted small">Click "Run All Payroll" above to generate payslips for active staff.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-modern align-middle">
              <thead>
                <tr>
                  <th>Slip ID</th>
                  <th>Employee</th>
                  <th>Gross Salary</th>
                  <th>Unpaid Deductions</th>
                  <th>Net Payable</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {monthPayrolls.map((p) => (
                  <tr key={p.id}>
                    <td><span className="badge-id">#{p.id}</span></td>
                    <td>
                      <div className="fw-semibold text-dark">{p.employeeName}</div>
                      <div className="text-muted small">{p.department} &bull; {p.employeeCode}</div>
                    </td>
                    <td className="fw-semibold">₹{Number(p.grossSalary).toLocaleString()}</td>
                    <td>
                      {p.unpaidDays > 0 ? (
                        <span className="text-danger small fw-semibold">
                          -₹{Number(p.unpaidDeduction).toLocaleString()} ({p.unpaidDays}d unpaid)
                        </span>
                      ) : (
                        <span className="text-muted small">₹0</span>
                      )}
                    </td>
                    <td>
                      <span className="fw-bold text-success fs-6">
                        ₹{Number(p.netSalary).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary px-2 py-1"
                          onClick={() => setSelectedPayslip(p)}
                        >
                          <i className="bi bi-file-earmark-text"></i> View Slip
                        </button>
                        {p.status !== 'PAID' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-success px-2 py-1"
                            onClick={() => handleMarkPaid(p.id)}
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Structures Configuration List */}
      <div className="custom-table-card">
        <div className="table-toolbar">
          <div>
            <h5 className="fw-bold mb-0 text-dark">Employee Salary Structures</h5>
            <div className="text-muted small">Configure base salary, allowances, and statutory deduction rules per staff member</div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-modern align-middle">
            <thead>
              <tr>
                <th>Code</th>
                <th>Employee Name</th>
                <th>Designation</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Estimated Net</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => {
                const struct = getSalaryStructure(emp);
                const estNet = struct.basicSalary + struct.totalAllowances - struct.totalDeductions;
                const isGenerated = monthPayrolls.some((p) => String(p.employeeId) === String(emp.id));

                return (
                  <tr key={emp.id}>
                    <td><span className="badge-id">{emp.employeeCode || `#${emp.id}`}</span></td>
                    <td className="fw-semibold">{emp.firstName} {emp.lastName}</td>
                    <td className="text-muted small">{emp.designation || 'Staff'}</td>
                    <td>₹{struct.basicSalary.toLocaleString()}</td>
                    <td>₹{struct.totalAllowances.toLocaleString()}</td>
                    <td>₹{struct.totalDeductions.toLocaleString()}</td>
                    <td className="fw-bold text-dark">₹{estNet.toLocaleString()}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border px-2 py-1"
                          onClick={() => openConfigModal(emp)}
                          title="Configure Structure"
                        >
                          <i className="bi bi-gear-fill me-1"></i> Configure
                        </button>

                        <button
                          type="button"
                          className={`btn btn-sm px-2 py-1 ${isGenerated ? 'btn-light border text-muted' : 'btn-outline-primary'}`}
                          onClick={() => handleGenerateSingle(emp)}
                          disabled={isGenerated}
                        >
                          {isGenerated ? (
                            <><i className="bi bi-check2 text-success me-1"></i> Generated</>
                          ) : (
                            <><i className="bi bi-play-fill me-1"></i> Run Slip</>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      {selectedPayslip && (
        <PayslipModal
          payroll={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}

      {/* Salary Configuration Modal */}
      {configEmployee && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom">
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <div>
                  <h5 className="fw-bold mb-0 text-dark">Configure Salary Structure</h5>
                  <div className="text-muted small">{configEmployee.firstName} {configEmployee.lastName} ({configEmployee.employeeCode})</div>
                </div>
                <button type="button" className="btn-close" onClick={() => setConfigEmployee(null)}></button>
              </div>

              <form onSubmit={handleSaveConfig}>
                <div className="mb-3">
                  <label className="custom-form-label">Basic Salary (₹ / month)</label>
                  <input
                    type="number"
                    className="form-control custom-input"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="custom-form-label">Total Allowances (HRA, Special, Travel)</label>
                  <input
                    type="number"
                    className="form-control custom-input"
                    value={allowances}
                    onChange={(e) => setAllowances(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="custom-form-label">Standard Deductions (PF, Insurance, Tax)</label>
                  <input
                    type="number"
                    className="form-control custom-input"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                    required
                  />
                  <div className="form-text small text-muted">
                    Unpaid leave penalties are calculated dynamically at runtime during payroll processing.
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3"
                    onClick={() => setConfigEmployee(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-gradient px-4">
                    Save Structure
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

export default PayrollComponent;
