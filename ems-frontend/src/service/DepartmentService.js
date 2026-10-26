import axios from 'axios';

const DEPT_API_BASE_URL = 'http://localhost:8080/api/departments';

export const listDepartments = () => axios.get(DEPT_API_BASE_URL);

export const getDepartment = (id) => axios.get(`${DEPT_API_BASE_URL}/${id}`);

export const createDepartment = (dept) => axios.post(DEPT_API_BASE_URL, dept);

export const updateDepartment = (id, dept) => axios.put(`${DEPT_API_BASE_URL}/${id}`, dept);

export const deleteDepartment = (id) => axios.delete(`${DEPT_API_BASE_URL}/${id}`);
