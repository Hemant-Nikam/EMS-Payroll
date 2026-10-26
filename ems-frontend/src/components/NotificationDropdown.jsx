import React, { useState, useEffect, useRef } from 'react';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../service/NotificationService';
import { useAuth } from '../context/AuthContext';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 10 seconds
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = () => {
    if (user) {
      setNotifications(getUserNotifications(user));
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAll = () => {
    markAllNotificationsAsRead(user);
    loadNotifications();
  };

  const handleItemClick = (id) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        type="button"
        className="btn btn-link text-white position-relative p-2"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        style={{ textDecoration: 'none' }}
      >
        <i className="bi bi-bell-fill fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border"
          style={{ width: '360px', zIndex: 1100, maxHeight: '420px', display: 'flex', flexDirection: 'column' }}
        >
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between">
            <div className="fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-bell text-primary"></i> Notifications
              {unreadCount > 0 && (
                <span className="badge bg-primary-subtle text-primary border" style={{ fontSize: '0.7rem' }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-link text-primary p-0 text-decoration-none small"
                onClick={handleMarkAll}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-auto flex-grow-1" style={{ maxHeight: '320px' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <i className="bi bi-bell-slash fs-4 d-block mb-1 text-secondary"></i>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-bottom text-start cursor-pointer transition ${n.read ? 'bg-white' : 'bg-light'}`}
                  onClick={() => handleItemClick(n.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start gap-2">
                    <span
                      className={`badge rounded-circle p-1 mt-1 ${
                        n.type === 'success' ? 'bg-success' : n.type === 'danger' ? 'bg-danger' : 'bg-primary'
                      }`}
                      style={{ width: '8px', height: '8px' }}
                    ></span>
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark small">{n.title}</div>
                      <div className="text-muted small" style={{ fontSize: '0.8rem' }}>{n.message}</div>
                      <div className="text-secondary small mt-1" style={{ fontSize: '0.7rem' }}>
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
