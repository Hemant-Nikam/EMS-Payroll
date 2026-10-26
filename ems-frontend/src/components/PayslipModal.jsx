import React from 'react';

const PayslipModal = ({ payroll, onClose }) => {
  if (!payroll) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop-custom">
      <div className="modal-dialog-custom" style={{ maxWidth: '680px' }}>
        <div className="p-4" id="printable-payslip">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
            <div className="d-flex align-items-center gap-3">
              <div className="brand-icon" style={{ width: '48px', height: '48px', fontSize: '1.4rem' }}>
                <i className="bi bi-building"></i>
              </div>
              <div>
                <h4 className="fw-bold mb-0 text-dark">EMS Enterprise Inc.</h4>
                <div className="text-muted small">Employee Salary Statement / Payslip</div>
              </div>
            </div>
            <div className="text-end">
              <span className={`badge ${payroll.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'} px-2 py-1`}>
                {payroll.status}
              </span>
              <div className="text-muted small mt-1">{payroll.payPeriodLabel}</div>
            </div>
          </div>

          {/* Employee & Pay Meta Grid */}
          <div className="bg-light p-3 rounded-3 border mb-4">
            <div className="row g-2 small">
              <div className="col-6">
                <div><span className="text-muted">Employee Name:</span> <strong className="text-dark">{payroll.employeeName}</strong></div>
                <div><span className="text-muted">Employee Code:</span> <strong>{payroll.employeeCode}</strong></div>
                <div><span className="text-muted">Email:</span> {payroll.email}</div>
              </div>
              <div className="col-6 text-end">
                <div><span className="text-muted">Payslip ID:</span> <strong>#{payroll.id}</strong></div>
                <div><span className="text-muted">Department:</span> <strong>{payroll.department}</strong></div>
                <div><span className="text-muted">Generated On:</span> {payroll.generatedDate}</div>
              </div>
            </div>
          </div>

          {/* Salary Breakdown Table */}
          <div className="row g-3 mb-4">
            {/* Earnings */}
            <div className="col-6">
              <div className="border rounded-3 p-3 h-100">
                <h6 className="fw-bold text-success border-bottom pb-2 mb-3">
                  <i className="bi bi-plus-circle me-1"></i> Earnings
                </h6>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Basic Salary:</span>
                  <span className="fw-semibold">₹{Number(payroll.basicSalary).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Allowances (HRA, Spl):</span>
                  <span className="fw-semibold">₹{Number(payroll.allowances).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between border-top pt-2 mt-3 fw-bold">
                  <span>Gross Salary:</span>
                  <span className="text-success">₹{Number(payroll.grossSalary).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="col-6">
              <div className="border rounded-3 p-3 h-100">
                <h6 className="fw-bold text-danger border-bottom pb-2 mb-3">
                  <i className="bi bi-dash-circle me-1"></i> Deductions
                </h6>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Statutory (PF, Tax):</span>
                  <span className="fw-semibold">₹{Number(payroll.configuredDeductions).toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Unpaid Leave Penalty:</span>
                  <span className="fw-semibold text-danger">
                    ₹{Number(payroll.unpaidDeduction).toLocaleString()} ({payroll.unpaidDays} days)
                  </span>
                </div>
                <div className="d-flex justify-content-between border-top pt-2 mt-3 fw-bold">
                  <span>Total Deductions:</span>
                  <span className="text-danger">₹{Number(payroll.totalDeductions).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Highlight Box */}
          <div className="p-3 rounded-3 text-white mb-4 d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1e1b4b, #4338ca)' }}>
            <div>
              <div className="small text-white-50">NET PAYABLE AMOUNT</div>
              <h3 className="fw-bold mb-0">₹{Number(payroll.netSalary).toLocaleString()}</h3>
            </div>
            <div className="text-end small text-white-50">
              <div>Mode: Direct Bank Transfer</div>
              {payroll.paymentDate && <div>Paid on: {payroll.paymentDate}</div>}
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center pt-2 border-top">
            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
              System generated payroll statement. Confidential document.
            </span>
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-secondary px-3 btn-sm" onClick={onClose}>
                Close
              </button>
              <button type="button" className="btn btn-primary px-3 btn-sm" onClick={handlePrint}>
                <i className="bi bi-printer-fill me-1"></i> Print Payslip
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipModal;
