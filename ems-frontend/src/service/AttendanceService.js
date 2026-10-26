// Attendance Service
import { logActivity } from './AuditService';

const ATTENDANCE_STORAGE_KEY = 'ems_attendance_records';

// Initialize default sample attendance if empty
export const getAttendanceRecords = () => {
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (!raw) {
      // Seed initial attendance for current date & yesterday
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const initial = [
        { id: 1, employeeId: 1, date: today, status: 'PRESENT', remarks: 'On time' },
        { id: 2, employeeId: 2, date: today, status: 'PRESENT', remarks: 'On time' },
        { id: 3, employeeId: 1, date: yesterday, status: 'PRESENT', remarks: 'On time' },
        { id: 4, employeeId: 2, date: yesterday, status: 'PAID_LEAVE', remarks: 'Casual Leave' }
      ];
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveAttendanceRecord = ({ employeeId, date, status, remarks = '', recordedBy = 'Admin' }) => {
  const records = getAttendanceRecords();
  const existingIndex = records.findIndex(
    (r) => String(r.employeeId) === String(employeeId) && r.date === date
  );

  let updatedRecord;
  if (existingIndex >= 0) {
    // Update / Correction
    records[existingIndex] = {
      ...records[existingIndex],
      status,
      remarks,
      updatedAt: new Date().toISOString(),
      updatedBy: recordedBy
    };
    updatedRecord = records[existingIndex];
    logActivity('ATTENDANCE_CORRECTED', `Updated attendance for Employee #${employeeId} on ${date} to ${status}`, recordedBy);
  } else {
    // New Record
    updatedRecord = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      employeeId: Number(employeeId),
      date,
      status,
      remarks,
      createdAt: new Date().toISOString(),
      recordedBy
    };
    records.push(updatedRecord);
    logActivity('ATTENDANCE_RECORDED', `Marked ${status} for Employee #${employeeId} on ${date}`, recordedBy);
  }

  localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(records));
  return updatedRecord;
};

// Batch mark for a given date
export const batchSaveAttendance = (recordsList, recordedBy = 'Admin') => {
  recordsList.forEach((item) => {
    saveAttendanceRecord({ ...item, recordedBy });
  });
};

// Get records by employee
export const getEmployeeAttendance = (employeeId, month = null) => {
  const records = getAttendanceRecords();
  return records.filter((r) => {
    const matchEmp = String(r.employeeId) === String(employeeId);
    if (!matchEmp) return false;
    if (month) {
      return r.date.startsWith(month); // e.g. "2026-10"
    }
    return true;
  });
};

// Get attendance for a specific date across all employees
export const getAttendanceByDate = (date) => {
  const records = getAttendanceRecords();
  return records.filter((r) => r.date === date);
};

// Calculate summary metrics for an employee in a given month/period
export const calculateAttendanceSummary = (employeeId, month = null) => {
  const records = getEmployeeAttendance(employeeId, month);
  const total = records.length;
  const present = records.filter((r) => r.status === 'PRESENT').length;
  const absent = records.filter((r) => r.status === 'ABSENT').length;
  const paidLeave = records.filter((r) => r.status === 'PAID_LEAVE').length;
  const unpaidLeave = records.filter((r) => r.status === 'UNPAID_LEAVE').length;

  const attendanceRate = total > 0 ? Math.round(((present + paidLeave) / total) * 100) : 100;

  return {
    totalRecords: total,
    present,
    absent,
    paidLeave,
    unpaidLeave,
    attendanceRate
  };
};
