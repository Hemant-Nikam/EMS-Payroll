import axios from "axios";

const REST_API_BASE_URL = 'http://localhost:8080/api/employees';

export const listEmployees = (department, status) => {
  const params = {};
  if (department && department !== 'ALL') params.department = department;
  if (status && status !== 'ALL') params.status = status;
  return axios.get(REST_API_BASE_URL, { params });
};

export const createEmployee = (employee) => axios.post(REST_API_BASE_URL, employee);

export const getEmployee = (employeeId) => axios.get(`${REST_API_BASE_URL}/${employeeId}`);

export const updateEmployee = (employeeId, employee) => axios.put(`${REST_API_BASE_URL}/${employeeId}`, employee);

export const toggleEmployeeStatus = (employeeId, status) =>
  axios.patch(`${REST_API_BASE_URL}/${employeeId}/status?status=${status}`);

export const deleteEmployee = (employeeId) => axios.delete(`${REST_API_BASE_URL}/${employeeId}`);
