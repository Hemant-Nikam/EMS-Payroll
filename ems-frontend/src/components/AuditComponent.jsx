import React, { useState, useEffect } from 'react';
import { getAuditLogs } from '../service/AuditService';

const AuditComponent = () => {
  const [logs, setLogs] = useState([]);
  const [filterAction, setFilterAction] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLogs(getAuditLogs());
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchAction = filterAction === 'ALL' || log.action.includes(filterAction);
    const matchSearch =
      !search ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase());
    return matchAction && matchSearch;
  });

  const getActionBadgeClass = (action) => {
    if (action.includes('LOGIN') || action.includes('REGISTERED')) return 'bg-info-subtle text-info border';
    if (action.includes('DELETED') || action.includes('REJECTED')) return 'bg-danger-subtle text-danger border';
    if (action.includes('CREATED') || action.includes('APPROVED') || action.includes('PAID'))
      return 'bg-success-subtle text-success border';
    return 'bg-primary-subtle text-primary border';
  };

  return (
    <div className="container-xl pt-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Audit & Activity Log</h2>
          <p className="text-muted small mb-0">Immutable tracking of administrative actions, payroll runs, and user access events</p>
        </div>
        <span className="badge bg-light text-dark border px-3 py-2">
          {logs.length} Total Audit Records
        </span>
      </div>

      <div className="custom-table-card">
        <div className="table-toolbar">
          <div className="d-flex align-items-center gap-3 flex-wrap flex-grow-1">
            <div className="search-box-wrapper" style={{ maxWidth: '320px' }}>
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search audit trail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select form-select-sm custom-input"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              >
                <option value="ALL">All Actions</option>
                <option value="PAYROLL">Payroll Activities</option>
                <option value="EMPLOYEE">Employee Changes</option>
                <option value="LEAVE">Leave Decisions</option>
                <option value="DEPARTMENT">Department Activities</option>
                <option value="LOGIN">User Access Events</option>
              </select>
            </div>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="empty-state-box text-center py-5">
            <i className="bi bi-shield-check fs-1 text-secondary mb-2 d-block"></i>
            <h6>No audit entries found</h6>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-modern align-middle">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Details</th>
                  <th>Performed By</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="small text-muted" style={{ whiteSpace: 'nowrap' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="small text-dark">{log.details}</td>
                    <td>
                      <span className="fw-semibold small">{log.performedBy}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditComponent;
