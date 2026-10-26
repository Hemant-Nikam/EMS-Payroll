package com.example.ems.controller;

import com.example.ems.entity.Department;
import com.example.ems.entity.Employee;
import com.example.ems.exception.ResourceNotFoundException;
import com.example.ems.repository.DepartmentRepository;
import com.example.ems.repository.EmployeeRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private DepartmentRepository departmentRepository;
    private EmployeeRepository employeeRepository;

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return ResponseEntity.ok(dept);
    }

    @PostMapping
    public ResponseEntity<?> createDepartment(@RequestBody Department department) {
        if (departmentRepository.findByDepartmentName(department.getDepartmentName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Department with this name already exists.");
        }
        Department saved = departmentRepository.save(department);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Department> updateDepartment(@PathVariable Long id, @RequestBody Department updatedDept) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        dept.setDepartmentName(updatedDept.getDepartmentName());
        dept.setDepartmentCode(updatedDept.getDepartmentCode());
        dept.setDepartmentDescription(updatedDept.getDepartmentDescription());

        Department saved = departmentRepository.save(dept);
        return ResponseEntity.ok(saved);
    }

    // Requirement 3.6: Prevent deletion of departments still associated with employees
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        List<Employee> allEmployees = employeeRepository.findAll();
        boolean hasAssociatedEmployees = allEmployees.stream()
                .anyMatch(emp -> emp.getDepartment() != null &&
                        (emp.getDepartment().equalsIgnoreCase(dept.getDepartmentName()) ||
                         emp.getDepartment().equalsIgnoreCase(dept.getDepartmentCode())));

        if (hasAssociatedEmployees) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Cannot delete department '" + dept.getDepartmentName() + "' because active employees are currently assigned to it.");
        }

        departmentRepository.deleteById(id);
        return ResponseEntity.ok("Department deleted successfully");
    }
}
