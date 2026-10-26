import React, { useEffect, useState } from 'react';
import { deleteEmployee, listEmployees, toggleEmployeeStatus } from '../service/EmployeeService';
import { listDepartments } from '../service/DepartmentService';
import { logActivity } from '../service/AuditService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ListEmployeeComponent = ({ addToast }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [empRes, deptRes] = await Promise.all([listEmployees(), listDepartments()]);
      setEmployees(empRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Could not connect to the backend server. Please verify Spring Boot is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (emp) => {
    const nextStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await toggleEmployeeStatus(emp.id, nextStatus);
      logActivity(
        'EMPLOYEE_STATUS_CHANGED',
        `Changed status of ${emp.firstName} ${emp.lastName} to ${nextStatus}`,
        user.name
      );
      if (addToast) {
        addToast(`Employee status updated to ${nextStatus}`, 'success');
      }
      setEmployees((prev) =>
        prev.map((e) => (e.id === emp.id ? { ...e, status: nextStatus } : e))
      );
    } catch (err) {
      console.error(err);
      if (addToast) addToast('Failed to update employee status.', 'danger');
    }
  };

  const confirmDelete = () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    deleteEmployee(employeeToDelete.id)
      .then(() => {
        logActivity('EMPLOYEE_DELETED', `Deleted employee: ${employeeToDelete.firstName} ${employeeToDelete.lastName}`, user.name);
        if (addToast) {
          addToast(`Employee "${employeeToDelete.firstName} ${employeeToDelete.lastName}" deleted successfully`, 'success');
        }
        setEmployees((prev) => prev.filter((emp) => emp.id !== employeeToDelete.id));
        setEmployeeToDelete(null);
      })
      .catch((err) => {
        console.error('Error deleting employee:', err);
        if (addToast) addToast('Failed to delete employee. Please check server logs.', 'danger');
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  // Filter employees based on search query, department, and status
  const filteredEmployees = employees.filter((emp) => {
    // Dept match
    if (filterDept !== 'ALL') {
      if (!emp.department || emp.department.toLowerCase() !== filterDept.toLowerCase()) {
        return false;
      }
    }
    // Status match
    if (filterStatus !== 'ALL') {
      const st = emp.status || 'ACTIVE';
      if (st.toUpperCase() !== filterStatus) return false;
    }
    // Search query match (Name, email, id, employeeCode)
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const id = String(emp.id || '');
    const code = (emp.employeeCode || '').toLowerCase();
    return fullName.includes(q) || email.includes(q) || id.includes(q) || code.includes(q);
  });

  const getInitials = (first = '', last = '') => {
    const f = first.charAt(0) || '';
    const l = last.charAt(0) || '';
    return (f + l).toUpperCase() || 'E';
  };

  const avatarColors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];
  const getAvatarColor = (id) => avatarColors[(Number(id) || 0) % avatarColors.length];

  const activeCount = employees.filter((e) => (e.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;

  return (
    <div className="container-xl pt-4">
      {/* Title & Stats */}
      <div className="row g-3 mb-4 align-items-center">
        <div className="col-12 col-md-6">
          <h2 className="fw-bold mb-1 text-dark">Employee Management</h2>
          <p className="text-muted small mb-0">Directory, designations, department allocation, and status control</p>
        </div>
        <div className="col-12 col-md-6">
          <div className="d-flex justify-content-md-end gap-2 flex-wrap">
            <div className="stat-card py-2 px-3">
              <div className="d-flex align-items-center gap-2">
                <div className="stat-icon-wrapper stat-icon-primary" style={{ width: '38px', height: '38px', fontSize: '1.1rem' }}>
                  <i className="bi bi-people-fill"></i>
                </div>
                <div>
                  <div className="fw-bold fs-6" style={{ lineHeight: 1.1 }}>{activeCount} / {employees.length}</div>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>Active Staff</div>
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary-gradient px-3"
              onClick={() => navigate('/add-employee')}
            >
              <i className="bi bi-person-plus-fill"></i>
              <span>Add Employee</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-octagon-fill fs-4 text-danger"></i>
            <div>
              <div className="fw-semibold">Connection Issue</div>
              <div className="small text-muted">{error}</div>
            </div>
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={fetchInitialData}>
            <i className="bi bi-arrow-clockwise me-1"></i> Retry
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="custom-table-card">
        {/* Table Toolbar & Filters */}
        <div className="table-toolbar">
          <div className="d-flex align-items-center gap-2 flex-wrap flex-grow-1">
            <div className="search-box-wrapper" style={{ minWidth: '240px', maxWidth: '300px' }}>
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                className="form-control search-input"
                placeholder="Search by name, ID, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                className="form-select form-select-sm custom-input"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.departmentName}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                className="form-select form-select-sm custom-input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Staff</option>
                <option value="INACTIVE">Inactive / Left</option>
              </select>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            {(searchQuery || filterDept !== 'ALL' || filterStatus !== 'ALL') && (
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => {
                  setSearchQuery('');
                  setFilterDept('ALL');
                  setFilterStatus('ALL');
                }}
              >
                Clear Filters
              </button>
            )}
            <button
              className="btn btn-sm btn-light border"
              onClick={fetchInitialData}
              title="Refresh list"
            >
              <i className="bi bi-arrow-clockwise"></i> Refresh
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3"></div>
            <div className="text-muted small">Loading employee records...</div>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state-box text-center py-5">
            <div className="empty-icon">
              <i className="bi bi-people"></i>
            </div>
            <h5 className="fw-bold mb-1">No employees found</h5>
            <p className="text-muted small mb-3">Try adjusting your search criteria or add a new employee.</p>
            <button className="btn btn-primary-gradient" onClick={() => navigate('/add-employee')}>
              Add New Employee
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-modern align-middle">
              <thead>
                <tr>
                  <th style={{ width: '110px' }}>Emp Code</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th className="text-end" style={{ width: '220px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const isActive = (emp.status || 'ACTIVE').toUpperCase() === 'ACTIVE';
                  return (
                    <tr key={emp.id} className={!isActive ? 'opacity-75' : ''}>
                      <td>
                        <span className="badge-id">{emp.employeeCode || `EMP-${emp.id}`}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="emp-avatar"
                            style={{ backgroundColor: getAvatarColor(emp.id) }}
                          >
                            {getInitials(emp.firstName, emp.lastName)}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-muted small">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {emp.department || 'General'}
                        </span>
                      </td>
                      <td className="small text-muted">{emp.designation || 'Staff Member'}</td>
                      <td>
                        <span
                          className={`badge ${
                            isActive
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : 'bg-secondary-subtle text-secondary border border-secondary-subtle'
                          }`}
                        >
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="action-buttons justify-content-end">
                          {/* View Profile */}
                          <button
                            type="button"
                            className="btn-action btn-light border text-primary"
                            onClick={() => setViewEmployee(emp)}
                            title="View Full Profile"
                          >
                            <i className="bi bi-eye-fill"></i>
                          </button>

                          {/* Edit */}
                          <button
                            className="btn-action btn-action-edit"
                            onClick={() => navigate(`/edit-employee/${emp.id}`)}
                            title="Edit employee"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          {/* Toggle Active/Inactive */}
                          <button
                            type="button"
                            className={`btn-action ${isActive ? 'btn-light border text-warning' : 'btn-light border text-success'}`}
                            onClick={() => handleToggleStatus(emp)}
                            title={isActive ? 'Deactivate employee' : 'Activate employee'}
                          >
                            <i className={`bi ${isActive ? 'bi-person-slash' : 'bi-person-check'}`}></i>
                          </button>

                          {/* Delete */}
                          <button
                            className="btn-action btn-action-delete"
                            onClick={() => setEmployeeToDelete(emp)}
                            title="Delete permanently"
                          >
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Employee Profile Modal */}
      {viewEmployee && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom" style={{ maxWidth: '580px' }}>
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="emp-avatar"
                    style={{ width: '48px', height: '48px', fontSize: '1.2rem', backgroundColor: getAvatarColor(viewEmployee.id) }}
                  >
                    {getInitials(viewEmployee.firstName, viewEmployee.lastName)}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0 text-dark">{viewEmployee.firstName} {viewEmployee.lastName}</h5>
                    <span className="badge-id">{viewEmployee.employeeCode || `EMP-${viewEmployee.id}`}</span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setViewEmployee(null)}></button>
              </div>

              <div className="row g-2 small mb-4">
                <div className="col-5 text-muted">Email Address:</div>
                <div className="col-7 fw-semibold">{viewEmployee.email}</div>

                <div className="col-5 text-muted">Contact Phone:</div>
                <div className="col-7">{viewEmployee.phone || 'N/A'}</div>

                <div className="col-5 text-muted">Department:</div>
                <div className="col-7"><span className="badge bg-light text-dark border">{viewEmployee.department || 'General'}</span></div>

                <div className="col-5 text-muted">Designation:</div>
                <div className="col-7 fw-semibold">{viewEmployee.designation || 'Staff'}</div>

                <div className="col-5 text-muted">Joining Date:</div>
                <div className="col-7">{viewEmployee.joiningDate || '2025-01-01'}</div>

                <div className="col-5 text-muted">Status:</div>
                <div className="col-7">
                  <span className={`badge ${viewEmployee.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                    {viewEmployee.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="col-5 text-muted">Base Salary:</div>
                <div className="col-7 fw-bold text-success">₹{(viewEmployee.basicSalary || 50000).toLocaleString()} / month</div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={() => setViewEmployee(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-3"
                  onClick={() => {
                    const id = viewEmployee.id;
                    setViewEmployee(null);
                    navigate(`/edit-employee/${id}`);
                  }}
                >
                  <i className="bi bi-pencil me-1"></i> Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom">
            <div className="p-4">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: '48px', height: '48px', background: '#fee2e2', color: '#dc2626' }}
                >
                  <i className="bi bi-trash3-fill fs-4"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-1 text-dark">Confirm Deletion</h5>
                  <p className="text-muted small mb-0">Record will be permanently purged from MySQL.</p>
                </div>
              </div>

              <div className="alert alert-light border p-3 rounded-3 mb-4">
                <div className="fw-semibold text-dark">
                  {employeeToDelete.firstName} {employeeToDelete.lastName}
                </div>
                <div className="text-muted small">{employeeToDelete.email} ({employeeToDelete.employeeCode || `#${employeeToDelete.id}`})</div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={() => setEmployeeToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Employee'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListEmployeeComponent;
