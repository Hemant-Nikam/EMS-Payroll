// Leave Management Service
import { saveAttendanceRecord } from './AttendanceService';
import { createNotification } from './NotificationService';
import { logActivity } from './AuditService';

const LEAVE_STORAGE_KEY = 'ems_leave_requests';

export const getLeaveRequests = () => {
  try {
    const raw = localStorage.getItem(LEAVE_STORAGE_KEY);
    if (!raw) {
      const initial = [
        {
          id: 101,
          employeeId: 1,
          employeeName: 'Hemant Nikam',
          leaveType: 'Annual Leave',
          startDate: '2026-11-05',
          endDate: '2026-11-07',
          reason: 'Family wedding event',
          status: 'APPROVED',
          appliedDate: '2026-10-20',
          adminRemarks: 'Approved. Enjoy your time off!',
          reviewedBy: 'Super Admin',
          reviewedAt: '2026-10-21'
        }
      ];
      localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const submitLeaveRequest = ({ employeeId, employeeName, employeeEmail, leaveType, startDate, endDate, reason }) => {
  // 1. Validation
  if (!startDate || !endDate) {
    return { success: false, message: 'Start date and End date are required.' };
  }
  if (new Date(startDate) > new Date(endDate)) {
    return { success: false, message: 'Start date cannot be after end date.' };
  }

  const allLeaves = getLeaveRequests();

  // 2. Conflict Check: Check for overlapping pending or approved leaves for this employee
  const hasConflict = allLeaves.some((l) => {
    if (String(l.employeeId) !== String(employeeId)) return false;
    if (l.status === 'REJECTED') return false;

    const existingStart = new Date(l.startDate);
    const existingEnd = new Date(l.endDate);
    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);

    // Overlap condition
    return reqStart <= existingEnd && reqEnd >= existingStart;
  });

  if (hasConflict) {
    return {
      success: false,
      message: 'You already have a pending or approved leave request covering these dates.'
    };
  }

  const newRequest = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    employeeId: Number(employeeId),
    employeeName,
    employeeEmail,
    leaveType,
    startDate,
    endDate,
    reason,
    status: 'PENDING',
    appliedDate: new Date().toISOString().split('T')[0],
    adminRemarks: '',
    reviewedBy: null,
    reviewedAt: null
  };

  allLeaves.unshift(newRequest);
  localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(allLeaves));

  // Notify Admins
  createNotification({
    targetRole: 'Admin',
    title: 'New Leave Request',
    message: `${employeeName} requested ${leaveType} from ${startDate} to ${endDate}.`,
    type: 'info'
  });

  logActivity('LEAVE_REQUEST_SUBMITTED', `${employeeName} submitted ${leaveType} (${startDate} to ${endDate})`, employeeName);

  return { success: true, request: newRequest };
};

export const reviewLeaveRequest = (requestId, status, adminRemarks = '', reviewedBy = 'Admin') => {
  const allLeaves = getLeaveRequests();
  const index = allLeaves.findIndex((l) => l.id === requestId);

  if (index < 0) {
    return { success: false, message: 'Leave request not found.' };
  }

  const leave = allLeaves[index];
  leave.status = status; // 'APPROVED' or 'REJECTED'
  leave.adminRemarks = adminRemarks;
  leave.reviewedBy = reviewedBy;
  leave.reviewedAt = new Date().toISOString().split('T')[0];

  allLeaves[index] = leave;
  localStorage.setItem(LEAVE_STORAGE_KEY, JSON.stringify(allLeaves));

  // If APPROVED: automatically record attendance for the range of dates!
  if (status === 'APPROVED') {
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const attendanceStatus = leave.leaveType === 'Unpaid Leave' ? 'UNPAID_LEAVE' : 'PAID_LEAVE';

    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
      const dateStr = dt.toISOString().split('T')[0];
      saveAttendanceRecord({
        employeeId: leave.employeeId,
        date: dateStr,
        status: attendanceStatus,
        remarks: `Approved Leave: ${leave.leaveType}`,
        recordedBy: reviewedBy
      });
    }
  }

  // Notify Employee
  createNotification({
    recipientEmail: leave.employeeEmail,
    title: `Leave Request ${status}`,
    message: `Your ${leave.leaveType} request for ${leave.startDate} to ${leave.endDate} has been ${status.toLowerCase()}.${adminRemarks ? ` Note: ${adminRemarks}` : ''}`,
    type: status === 'APPROVED' ? 'success' : 'danger'
  });

  logActivity(`LEAVE_${status}`, `${reviewedBy} ${status.toLowerCase()} leave request #${requestId} for ${leave.employeeName}`, reviewedBy);

  return { success: true, leave };
};

export const getEmployeeLeaveRequests = (employeeId) => {
  const allLeaves = getLeaveRequests();
  return allLeaves.filter((l) => String(l.employeeId) === String(employeeId));
};
