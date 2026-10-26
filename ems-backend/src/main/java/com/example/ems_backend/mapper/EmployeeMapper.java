package com.example.ems.mapper;

import com.example.ems.dto.EmployeeDto;
import com.example.ems.entity.Employee;

public class EmployeeMapper {

    public static EmployeeDto mapToEmployeeDto(Employee employee) {
        if (employee == null) return null;
        return new EmployeeDto(
                employee.getId(),
                employee.getEmployeeCode() != null ? employee.getEmployeeCode() : "EMP-" + (1000 + (employee.getId() != null ? employee.getId() : 0)),
                employee.getFirstName(),
                employee.getLastName(),
                employee.getEmail(),
                employee.getPhone(),
                employee.getDepartment() != null ? employee.getDepartment() : "General",
                employee.getDesignation() != null ? employee.getDesignation() : "Staff Member",
                employee.getJoiningDate() != null ? employee.getJoiningDate() : "2025-01-01",
                employee.getStatus() != null ? employee.getStatus() : "ACTIVE",
                employee.getBasicSalary() != null ? employee.getBasicSalary() : 50000.0,
                employee.getAllowances() != null ? employee.getAllowances() : 10000.0,
                employee.getDeductions() != null ? employee.getDeductions() : 5000.0
        );
    }

    public static Employee mapToEmployee(EmployeeDto dto) {
        if (dto == null) return null;
        return new Employee(
                dto.getId(),
                dto.getEmployeeCode(),
                dto.getFirstName(),
                dto.getLastName(),
                dto.getEmail(),
                dto.getPhone(),
                dto.getDepartment(),
                dto.getDesignation(),
                dto.getJoiningDate(),
                dto.getStatus() != null ? dto.getStatus() : "ACTIVE",
                dto.getBasicSalary() != null ? dto.getBasicSalary() : 50000.0,
                dto.getAllowances() != null ? dto.getAllowances() : 10000.0,
                dto.getDeductions() != null ? dto.getDeductions() : 5000.0
        );
    }
}
