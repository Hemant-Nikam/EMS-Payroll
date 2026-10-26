import React, { useState, useEffect } from 'react';
import { createEmployee, getEmployee, updateEmployee } from '../service/EmployeeService';
import { listDepartments } from '../service/DepartmentService';
import { logActivity } from '../service/AuditService';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';

const EmployeeComponent = ({ addToast }) => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Software Engineer');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('ACTIVE');
  const [basicSalary, setBasicSalary] = useState('50000');

  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(false);
  const [serverError, setServerError] = useState('');

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Load departments
    listDepartments()
      .then((res) => {
        setDepartments(res.data || []);
        if (res.data && res.data.length > 0 && !id) {
          setDepartment(res.data[0].departmentName);
        }
      })
      .catch((e) => console.error(e));

    // If edit mode, load employee
    if (id) {
      setLoadingEmployee(true);
      getEmployee(id)
        .then((response) => {
          if (response.data) {
            setFirstName(response.data.firstName || '');
            setLastName(response.data.lastName || '');
            setEmail(response.data.email || '');
            setPhone(response.data.phone || '');
            setDepartment(response.data.department || 'Engineering');
            setDesignation(response.data.designation || 'Software Engineer');
            setJoiningDate(response.data.joiningDate || new Date().toISOString().split('T')[0]);
            setStatus(response.data.status || 'ACTIVE');
            setBasicSalary(String(response.data.basicSalary || 50000));
          }
        })
        .catch((error) => {
          console.error('Error fetching employee:', error);
          setServerError('Failed to load employee details from server.');
        })
        .finally(() => {
          setLoadingEmployee(false);
        });
    }
  }, [id]);

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters.';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveOrUpdateEmployee = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    const employee = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      department,
      designation: designation.trim(),
      joiningDate,
      status,
      basicSalary: Number(basicSalary) || 50000
    };

    setIsSubmitting(true);

    try {
      if (id) {
        await updateEmployee(id, employee);
        logActivity('EMPLOYEE_UPDATED', `Updated employee #${id}: ${employee.firstName} ${employee.lastName}`, user.name);
        if (addToast) {
          addToast(`Employee "${employee.firstName} ${employee.lastName}" updated successfully!`, 'success');
        }
        navigate('/employees');
      } else {
        const res = await createEmployee(employee);
        logActivity('EMPLOYEE_CREATED', `Added new employee: ${employee.firstName} ${employee.lastName} (${res.data.employeeCode})`, user.name);
        if (addToast) {
          addToast(`Employee "${employee.firstName} ${employee.lastName}" created successfully!`, 'success');
        }
        navigate('/employees');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      const msg = error.response?.data?.message || error.message || 'Operation failed';
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('constraint') || error.response?.status === 500) {
        setServerError('An employee with this email already exists in the database.');
      } else {
        setServerError('Failed to save employee. Please verify backend connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-xl pt-4 pb-5">
      <div className="mb-3">
        <Link to="/employees" className="text-muted d-inline-flex align-items-center gap-1 small text-decoration-none fw-semibold">
          <i className="bi bi-arrow-left"></i>
          <span>Back to Employee Directory</span>
        </Link>
      </div>

      <div className="form-card" style={{ maxWidth: '680px' }}>
        <div className="form-header-gradient">
          <div className="d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', background: 'rgba(255, 255, 255, 0.2)' }}
            >
              <i className={`bi ${id ? 'bi-pencil-square' : 'bi-person-plus-fill'} fs-4`}></i>
            </div>
            <div>
              <h4 className="fw-bold mb-0 text-white">
                {id ? 'Update Employee Information' : 'Add New Employee'}
              </h4>
              <p className="small mb-0 text-white-50">
                {id ? `Editing record #${id}` : 'Auto-generates unique ID and configures payroll profile'}
              </p>
            </div>
          </div>
        </div>

        <div className="form-card-body">
          {serverError && (
            <div className="alert alert-danger py-2 px-3 d-flex align-items-center gap-2 mb-4" style={{ fontSize: '0.875rem' }}>
              <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
              <span>{serverError}</span>
            </div>
          )}

          {loadingEmployee ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2"></div>
              <div className="text-muted small">Loading employee data...</div>
            </div>
          ) : (
            <form onSubmit={saveOrUpdateEmployee} noValidate>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="custom-form-label">First Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Robert"
                    value={firstName}
                    className={`form-control custom-input ${errors.firstName ? 'is-invalid-custom' : ''}`}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (errors.firstName) setErrors({ ...errors, firstName: null });
                    }}
                  />
                  {errors.firstName && <div className="invalid-feedback-custom">{errors.firstName}</div>}
                </div>

                <div className="col-md-6">
                  <label className="custom-form-label">Last Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Miller"
                    value={lastName}
                    className={`form-control custom-input ${errors.lastName ? 'is-invalid-custom' : ''}`}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errors.lastName) setErrors({ ...errors, lastName: null });
                    }}
                  />
                  {errors.lastName && <div className="invalid-feedback-custom">{errors.lastName}</div>}
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="custom-form-label">Work Email *</label>
                  <input
                    type="email"
                    placeholder="e.g. robert@company.com"
                    value={email}
                    className={`form-control custom-input ${errors.email ? 'is-invalid-custom' : ''}`}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                  />
                  {errors.email && <div className="invalid-feedback-custom">{errors.email}</div>}
                </div>

                <div className="col-md-6">
                  <label className="custom-form-label">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    className="form-control custom-input"
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="custom-form-label">Assigned Department</label>
                  <select
                    className="form-select custom-input"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    {departments.length === 0 ? (
                      <option value="General">General</option>
                    ) : (
                      departments.map((d) => (
                        <option key={d.id} value={d.departmentName}>{d.departmentName}</option>
                      ))
                    )}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="custom-form-label">Job Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Fullstack Engineer"
                    value={designation}
                    className="form-control custom-input"
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="custom-form-label">Joining Date</label>
                  <input
                    type="date"
                    className="form-control custom-input"
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                  />
                </div>

                <div className="col-md-4">
                  <label className="custom-form-label">Employment Status</label>
                  <select
                    className="form-select custom-input"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE (Left)</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="custom-form-label">Base Salary (₹)</label>
                  <input
                    type="number"
                    className="form-control custom-input"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                  />
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 py-2 rounded-3"
                  onClick={() => navigate('/employees')}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary-gradient px-4 py-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-1"></i>
                      <span>{id ? 'Update Employee' : 'Submit Employee'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeComponent;
