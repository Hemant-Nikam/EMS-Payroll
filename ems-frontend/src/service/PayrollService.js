// Payroll Management Service
import { calculateAttendanceSummary } from './AttendanceService';
import { createNotification } from './NotificationService';
import { logActivity } from './AuditService';

const PAYROLL_STORAGE_KEY = 'ems_payroll_records';
const SALARY_CONFIG_KEY = 'ems_salary_configs';

// Salary structures per employee (defaults if not custom configured)
export const getSalaryStructure = (employee) => {
  try {
    const configs = JSON.parse(localStorage.getItem(SALARY_CONFIG_KEY) || '{}');
    if (configs[employee.id]) {
      return configs[employee.id];
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback to employee's own basicSalary or standard breakdown
  const basic = Number(employee.basicSalary) || 50000;
  const allowances = Number(employee.allowances) || 12000;
  const deductions = Number(employee.deductions) || 6000;

  return {
    employeeId: employee.id,
    basicSalary: basic,
    hra: Math.round(allowances * 0.5),
    specialAllowance: Math.round(allowances * 0.3),
    conveyance: Math.round(allowances * 0.2),
    totalAllowances: allowances,
    providentFund: Math.round(deductions * 0.6),
    professionalTax: 200,
    healthInsurance: Math.round(deductions * 0.4) - 200,
    totalDeductions: deductions
  };
};

export const saveSalaryStructure = (employeeId, structure, adminUser = 'Admin') => {
  try {
    const configs = JSON.parse(localStorage.getItem(SALARY_CONFIG_KEY) || '{}');
    configs[employeeId] = structure;
    localStorage.setItem(SALARY_CONFIG_KEY, JSON.stringify(configs));
    logActivity('SALARY_STRUCTURE_UPDATED', `Updated salary structure for Employee #${employeeId}`, adminUser);
    return { success: true, structure };
  } catch (e) {
    return { success: false, message: e.message };
  }
};

export const getPayrollRecords = () => {
  try {
    const raw = localStorage.getItem(PAYROLL_STORAGE_KEY);
    if (!raw) {
      const initial = [
        {
          id: 'PAY-1001',
          employeeId: 1,
          employeeName: 'Hemant Nikam',
          employeeCode: 'EMP-1001',
          department: 'Engineering',
          payPeriod: '2026-09',
          payPeriodLabel: 'September 2026',
          basicSalary: 55000,
          allowances: 15000,
          grossSalary: 70000,
          configuredDeductions: 7000,
          unpaidDays: 0,
          unpaidDeduction: 0,
          totalDeductions: 7000,
          netSalary: 63000,
          status: 'PAID',
          paymentDate: '2026-09-30',
          generatedDate: '2026-09-28',
          processedBy: 'Super Admin'
        }
      ];
      localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

// Generate monthly payroll for an employee
export const generatePayroll = (employee, payPeriod, adminUser = 'Admin') => {
  // PayPeriod format: "YYYY-MM" (e.g. "2026-10")
  const records = getPayrollRecords();

  // Requirement 6.8: Prevent duplicate payroll generation for same employee and pay period
  const existing = records.find(
    (p) => String(p.employeeId) === String(employee.id) && p.payPeriod === payPeriod
  );
  if (existing) {
    return {
      success: false,
      message: `Payroll for ${employee.firstName} ${employee.lastName} (${payPeriod}) has already been generated!`
    };
  }

  const structure = getSalaryStructure(employee);
  const basic = structure.basicSalary;
  const allowances = structure.totalAllowances;
  const gross = basic + allowances;

  // Requirement 6.6: Consider attendance & unpaid leave when calculating salary
  const attendanceSummary = calculateAttendanceSummary(employee.id, payPeriod);
  const unpaidDays = attendanceSummary.unpaidLeave || 0;
  // Standard per day deduction = Gross / 30
  const perDayRate = gross / 30;
  const unpaidDeduction = Math.round(perDayRate * unpaidDays);

  const configuredDeductions = structure.totalDeductions;
  const totalDeductions = configuredDeductions + unpaidDeduction;
  const netSalary = Math.max(0, gross - totalDeductions);

  // Month label formatting (e.g. "October 2026")
  const [year, month] = payPeriod.split('-');
  const dateObj = new Date(year, parseInt(month) - 1, 1);
  const monthName = dateObj.toLocaleString('default', { month: 'long' });
  const payPeriodLabel = `${monthName} ${year}`;

  const newPayroll = {
    id: `PAY-${Date.now().toString().slice(-6)}`,
    employeeId: employee.id,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    employeeCode: employee.employeeCode || `EMP-${employee.id}`,
    department: employee.department || 'General',
    email: employee.email,
    payPeriod,
    payPeriodLabel,
    basicSalary: basic,
    allowances,
    grossSalary: gross,
    configuredDeductions,
    unpaidDays,
    unpaidDeduction,
    totalDeductions,
    netSalary,
    status: 'PROCESSED',
    generatedDate: new Date().toISOString().split('T')[0],
    paymentDate: null,
    processedBy: adminUser
  };

  records.unshift(newPayroll);
  localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(records));

  // Notify Employee
  createNotification({
    recipientEmail: employee.email,
    title: 'Payslip Available',
    message: `Your payslip for ${payPeriodLabel} has been generated. Net Salary: ₹${netSalary.toLocaleString()}`,
    type: 'success'
  });

  logActivity(
    'PAYROLL_GENERATED',
    `Generated payroll for ${employee.firstName} ${employee.lastName} for ${payPeriodLabel} (Net: ₹${netSalary})`,
    adminUser
  );

  return { success: true, payroll: newPayroll };
};

// Batch generate payroll for all active employees for a month
export const generateBatchPayroll = (employees, payPeriod, adminUser = 'Admin') => {
  const results = { generated: 0, skipped: 0, errors: [] };
  const activeEmployees = employees.filter((e) => (e.status || 'ACTIVE').toUpperCase() === 'ACTIVE');

  activeEmployees.forEach((emp) => {
    const res = generatePayroll(emp, payPeriod, adminUser);
    if (res.success) {
      results.generated++;
    } else {
      results.skipped++;
      results.errors.push(res.message);
    }
  });

  return results;
};

// Update status (e.g. PROCESSED -> PAID)
export const updatePayrollStatus = (payrollId, status, adminUser = 'Admin') => {
  const records = getPayrollRecords();
  const index = records.findIndex((p) => p.id === payrollId);
  if (index >= 0) {
    records[index].status = status;
    if (status === 'PAID') {
      records[index].paymentDate = new Date().toISOString().split('T')[0];
    }
    localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(records));
    logActivity('PAYROLL_STATUS_UPDATED', `Marked Payroll ${payrollId} as ${status}`, adminUser);
    return true;
  }
  return false;
};

// Get payroll for specific employee
export const getEmployeePayrolls = (employeeId) => {
  const records = getPayrollRecords();
  return records.filter((p) => String(p.employeeId) === String(employeeId));
};
