// In-app Notification Service
const NOTIFS_STORAGE_KEY = 'ems_notifications';

export const createNotification = ({ recipientEmail = null, targetRole = null, title, message, type = 'info' }) => {
  try {
    const list = JSON.parse(localStorage.getItem(NOTIFS_STORAGE_KEY) || '[]');
    const newNotif = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      recipientEmail, // Specific employee or null for role-wide
      targetRole, // 'Admin', 'Employee', or null for all
      title,
      message,
      type, // 'success', 'info', 'warning', 'danger'
      read: false,
      timestamp: new Date().toISOString()
    };
    list.unshift(newNotif);
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(list));
    return newNotif;
  } catch (e) {
    console.error('Failed to create notification:', e);
  }
};

export const getUserNotifications = (currentUser) => {
  try {
    const list = JSON.parse(localStorage.getItem(NOTIFS_STORAGE_KEY) || '[]');
    if (!currentUser) return [];

    return list.filter((n) => {
      // Matches specific user email
      if (n.recipientEmail && n.recipientEmail.toLowerCase() === currentUser.email?.toLowerCase()) {
        return true;
      }
      // Matches role (e.g. 'Admin' or 'Employee')
      if (n.targetRole) {
        if (n.targetRole === 'Admin' && (currentUser.role === 'Administrator' || currentUser.role === 'Super Admin' || currentUser.role === 'HR Manager')) {
          return true;
        }
        if (n.targetRole === 'Employee' && currentUser.role === 'Employee') {
          return true;
        }
      }
      // Global broadcast
      if (!n.recipientEmail && !n.targetRole) return true;
      return false;
    });
  } catch {
    return [];
  }
};

export const markNotificationAsRead = (id) => {
  try {
    const list = JSON.parse(localStorage.getItem(NOTIFS_STORAGE_KEY) || '[]');
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
};

export const markAllNotificationsAsRead = (currentUser) => {
  try {
    const list = JSON.parse(localStorage.getItem(NOTIFS_STORAGE_KEY) || '[]');
    const updated = list.map((n) => {
      if (!n.recipientEmail || n.recipientEmail.toLowerCase() === currentUser?.email?.toLowerCase()) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
};
