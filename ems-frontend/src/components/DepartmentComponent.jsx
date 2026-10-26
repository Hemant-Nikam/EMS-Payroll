import React, { useState, useEffect } from 'react';
import { listDepartments, createDepartment, updateDepartment, deleteDepartment } from '../service/DepartmentService';
import { listEmployees } from '../service/EmployeeService';
import { logActivity } from '../service/AuditService';
import { useAuth } from '../context/AuthContext';

const DepartmentComponent = ({ addToast }) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View employees modal state
  const [viewDeptEmployees, setViewDeptEmployees] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [deptRes, empRes] = await Promise.all([listDepartments(), listEmployees()]);
      setDepartments(deptRes.data || []);
      setEmployees(empRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch departments from the server.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditId(null);
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (dept) => {
    setEditId(dept.id);
    setDeptName(dept.departmentName);
    setDeptCode(dept.departmentCode);
    setDeptDesc(dept.departmentDescription || '');
    setFormError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!deptName.trim()) {
      setFormError('Department name is required.');
      return;
    }
    if (!deptCode.trim()) {
      setFormError('Department code is required.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      departmentName: deptName.trim(),
      departmentCode: deptCode.trim().toUpperCase(),
      departmentDescription: deptDesc.trim()
    };

    try {
      if (editId) {
        await updateDepartment(editId, payload);
        logActivity('DEPARTMENT_UPDATED', `Updated department: ${payload.departmentName} (${payload.departmentCode})`, user.name);
        if (addToast) addToast(`Department "${payload.departmentName}" updated successfully!`, 'success');
      } else {
        await createDepartment(payload);
        logActivity('DEPARTMENT_CREATED', `Created department: ${payload.departmentName} (${payload.departmentCode})`, user.name);
        if (addToast) addToast(`Department "${payload.departmentName}" created successfully!`, 'success');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || err.message || 'Operation failed.';
      setFormError(typeof msg === 'string' ? msg : 'Error saving department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Requirement 3.6: Prevent deletion of departments that are still associated with employees
  const handleDelete = async (dept) => {
    const assigned = employees.filter(
      (e) => e.department && (e.department.equalsIgnoreCase ? e.department.equalsIgnoreCase(dept.departmentName) : e.department.toLowerCase() === dept.departmentName.toLowerCase())
    );

    if (assigned.length > 0) {
      if (addToast) {
        addToast(`Cannot delete "${dept.departmentName}": ${assigned.length} employee(s) are assigned to it.`, 'danger');
      }
      return;
    }

    if (window.confirm(`Are you sure you want to delete department "${dept.departmentName}"?`)) {
      try {
        await deleteDepartment(dept.id);
        logActivity('DEPARTMENT_DELETED', `Deleted department: ${dept.departmentName}`, user.name);
        if (addToast) addToast(`Department "${dept.departmentName}" deleted.`, 'success');
        loadData();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data || 'Failed to delete department.';
        if (addToast) addToast(typeof msg === 'string' ? msg : 'Deletion failed.', 'danger');
      }
    }
  };

  const getEmployeesInDept = (deptName) => {
    return employees.filter(
      (e) => e.department && e.department.toLowerCase() === deptName.toLowerCase()
    );
  };

  return (
    <div className="container-xl pt-4">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1 text-dark">Department Management</h2>
          <p className="text-muted small mb-0">Organize organizational units, branches, and team allocations</p>
        </div>
        <button className="btn btn-primary-gradient" onClick={openCreateModal}>
          <i className="bi bi-plus-circle-fill"></i> Add Department
        </button>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger" onClick={loadData}>Retry</button>
        </div>
      )}

      {/* Department Cards Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-2"></div>
          <div className="text-muted small">Loading departments...</div>
        </div>
      ) : departments.length === 0 ? (
        <div className="custom-table-card empty-state-box text-center py-5">
          <i className="bi bi-diagram-3 fs-1 text-secondary mb-3 d-block"></i>
          <h5>No departments created yet</h5>
          <p className="text-muted small">Create your first department to organize employees.</p>
          <button className="btn btn-primary-gradient mt-2" onClick={openCreateModal}>
            Create Department
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {departments.map((dept) => {
            const assigned = getEmployeesInDept(dept.departmentName);
            return (
              <div key={dept.id} className="col-12 col-md-6 col-lg-4">
                <div className="modern-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="badge bg-primary-subtle text-primary border fw-bold px-2 py-1">
                        {dept.departmentCode}
                      </span>
                      <div className="dropdown">
                        <button
                          className="btn btn-sm btn-light border px-2 py-1"
                          onClick={() => openEditModal(dept)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-light border text-danger ms-1 px-2 py-1"
                          onClick={() => handleDelete(dept)}
                          title="Delete"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </div>
                    <h5 className="fw-bold text-dark mb-1">{dept.departmentName}</h5>
                    <p className="text-muted small mb-3">
                      {dept.departmentDescription || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-people-fill text-secondary"></i>
                      <span className="small fw-semibold text-dark">
                        {assigned.length} {assigned.length === 1 ? 'Employee' : 'Employees'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setViewDeptEmployees({ dept, employees: assigned })}
                    >
                      View Team
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom">
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold mb-0 text-dark">
                  {editId ? 'Edit Department' : 'Create New Department'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              {formError && (
                <div className="alert alert-danger py-2 px-3 small mb-3">{formError}</div>
              )}

              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="custom-form-label">Department Name</label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    placeholder="e.g. Information Technology"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="custom-form-label">Department Code</label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    placeholder="e.g. IT, HR, FIN"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
                  />
                </div>

                <div className="mb-4">
                  <label className="custom-form-label">Description</label>
                  <textarea
                    rows="3"
                    className="form-control custom-input"
                    placeholder="Brief description of department scope..."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                  ></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-gradient px-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : editId ? 'Update Department' : 'Save Department'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Employees in Department Modal */}
      {viewDeptEmployees && (
        <div className="modal-backdrop-custom">
          <div className="modal-dialog-custom" style={{ maxWidth: '600px' }}>
            <div className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <div>
                  <h5 className="fw-bold mb-0 text-dark">
                    {viewDeptEmployees.dept.departmentName} Team
                  </h5>
                  <div className="text-muted small">
                    {viewDeptEmployees.employees.length} members assigned
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setViewDeptEmployees(null)}
                ></button>
              </div>

              {viewDeptEmployees.employees.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No employees are currently assigned to this department.
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '350px' }}>
                  <table className="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Designation</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewDeptEmployees.employees.map((emp) => (
                        <tr key={emp.id}>
                          <td><span className="badge-id">{emp.employeeCode || `#${emp.id}`}</span></td>
                          <td className="fw-semibold">{emp.firstName} {emp.lastName}</td>
                          <td className="text-muted small">{emp.designation || 'Staff'}</td>
                          <td>
                            <span className={`badge ${emp.status === 'ACTIVE' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                              {emp.status || 'ACTIVE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="d-flex justify-content-end mt-3">
                <button
                  type="button"
                  className="btn btn-secondary px-3"
                  onClick={() => setViewDeptEmployees(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentComponent;
