package com.example.ems.service.impl;

import com.example.ems.dto.EmployeeDto;
import com.example.ems.entity.Employee;
import com.example.ems.exception.ResourceNotFoundException;
import com.example.ems.mapper.EmployeeMapper;
import com.example.ems.repository.EmployeeRepository;
import com.example.ems.service.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private EmployeeRepository employeeRepository;

    @Override
    public EmployeeDto createEmployee(EmployeeDto employeeDto) {
        Employee employee = EmployeeMapper.mapToEmployee(employeeDto);

        if (employee.getStatus() == null || employee.getStatus().isBlank()) {
            employee.setStatus("ACTIVE");
        }
        if (employee.getJoiningDate() == null || employee.getJoiningDate().isBlank()) {
            employee.setJoiningDate(LocalDate.now().toString());
        }

        Employee savedEmployee = employeeRepository.save(employee);

        // Generate unique employee code if not provided
        if (savedEmployee.getEmployeeCode() == null || savedEmployee.getEmployeeCode().isBlank()) {
            savedEmployee.setEmployeeCode("EMP-" + (1000 + savedEmployee.getId()));
            savedEmployee = employeeRepository.save(savedEmployee);
        }

        return EmployeeMapper.mapToEmployeeDto(savedEmployee);
    }

    @Override
    public EmployeeDto getEmployeeId(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee does not exist with given id: " + employeeId));
        return EmployeeMapper.mapToEmployeeDto(employee);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream().map(EmployeeMapper::mapToEmployeeDto).collect(Collectors.toList());
    }

    @Override
    public EmployeeDto updateEmployee(Long employeeId, EmployeeDto employeeDto) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee does not exist with given id: " + employeeId));

        employee.setFirstName(employeeDto.getFirstName());
        employee.setLastName(employeeDto.getLastName());
        employee.setEmail(employeeDto.getEmail());
        if (employeeDto.getPhone() != null) employee.setPhone(employeeDto.getPhone());
        if (employeeDto.getDepartment() != null) employee.setDepartment(employeeDto.getDepartment());
        if (employeeDto.getDesignation() != null) employee.setDesignation(employeeDto.getDesignation());
        if (employeeDto.getJoiningDate() != null) employee.setJoiningDate(employeeDto.getJoiningDate());
        if (employeeDto.getStatus() != null) employee.setStatus(employeeDto.getStatus());
        if (employeeDto.getBasicSalary() != null) employee.setBasicSalary(employeeDto.getBasicSalary());
        if (employeeDto.getAllowances() != null) employee.setAllowances(employeeDto.getAllowances());
        if (employeeDto.getDeductions() != null) employee.setDeductions(employeeDto.getDeductions());

        Employee updatedEmployeeObj = employeeRepository.save(employee);
        return EmployeeMapper.mapToEmployeeDto(updatedEmployeeObj);
    }

    @Override
    public void deleteEmployee(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee does not exist with given id: " + employeeId));
        employeeRepository.deleteById(employeeId);
    }
}
