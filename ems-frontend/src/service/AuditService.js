// Audit Trail Service for tracking administrative activities
const AUDIT_STORAGE_KEY = 'ems_audit_logs';

export const logActivity = (action, details, performedBy = 'System Admin') => {
  try {
    const logs = JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
    const newEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      action,
      details,
      performedBy,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newEntry);
    // Keep last 200 logs
    if (logs.length > 200) logs.pop();
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    return newEntry;
  } catch (e) {
    console.error('Failed to log audit activity:', e);
  }
};

export const getAuditLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(AUDIT_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};
