package com.example.ems.controller;

import com.example.ems.dto.EmployeeDto;
import com.example.ems.service.EmployeeService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private EmployeeService employeeService;

    // Create Employee REST API
    @PostMapping
    public ResponseEntity<EmployeeDto> createEmployee(@RequestBody EmployeeDto employeeDto) {
        EmployeeDto savedEmployee = employeeService.createEmployee(employeeDto);
        return new ResponseEntity<>(savedEmployee, HttpStatus.CREATED);
    }

    // Get Employee by ID REST API
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable("id") Long employeeId) {
        EmployeeDto employeeDto = employeeService.getEmployeeId(employeeId);
        return ResponseEntity.ok(employeeDto);
    }

    // Get All Employees REST API with optional filtering
    @GetMapping
    public ResponseEntity<List<EmployeeDto>> getAllEmployees(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String status) {
        List<EmployeeDto> employees = employeeService.getAllEmployees();

        if (department != null && !department.isBlank() && !department.equalsIgnoreCase("ALL")) {
            employees = employees.stream()
                    .filter(e -> e.getDepartment() != null && e.getDepartment().equalsIgnoreCase(department))
                    .collect(Collectors.toList());
        }

        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            employees = employees.stream()
                    .filter(e -> e.getStatus() != null && e.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(employees);
    }

    // Update Employee REST API
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable("id") Long employeeId,
                                                      @RequestBody EmployeeDto updatedEmployee) {
        EmployeeDto employeeDto = employeeService.updateEmployee(employeeId, updatedEmployee);
        return ResponseEntity.ok(employeeDto);
    }

    // Toggle Status (ACTIVE / INACTIVE) REST API
    @PatchMapping("/{id}/status")
    public ResponseEntity<EmployeeDto> toggleStatus(@PathVariable("id") Long employeeId,
                                                    @RequestParam String status) {
        EmployeeDto current = employeeService.getEmployeeId(employeeId);
        current.setStatus(status);
        EmployeeDto updated = employeeService.updateEmployee(employeeId, current);
        return ResponseEntity.ok(updated);
    }

    // Delete Employee REST API
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable("id") Long employeeId) {
        employeeService.deleteEmployee(employeeId);
        return ResponseEntity.ok("Employee deleted successfully");
    }
}
