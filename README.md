# EMS Pro - Enterprise Employee Management & Payroll System

A full-stack enterprise web application built using **Spring Boot 3 (Java 17/24)** for the backend REST APIs, **React 19** with **Vite** for the frontend, **Bootstrap 5** for modern UI design, and **MySQL** for relational database persistence.

---

## 📌 Functional Requirements & Implemented Features

### 1. User Authentication and Authorization
- [x] **1.1 Secure Authentication**: Secure login and logout mechanisms with persistent user session state (`localStorage` token/session management).
- [x] **1.2 Dual Role Support**: First-class support for **Admin** and **Employee** roles.
- [x] **1.3 Role-Based Access Control (RBAC)**:
  - **Admin Role**: Full access to Employee Management, Departments, Attendance, Leaves, Payroll, Reports, and Audit Logs.
  - **Employee Role**: Access restricted to Employee Self-Service Portal (`/employee-portal`), personal attendance log, time-off requests, and personal payslips.
- [x] **1.4 Password Management**: Self-service change password modal for authenticated users.
- [x] **1.5 Account Status Control**: Administrators can activate or deactivate employee user accounts; deactivated accounts are barred from logging in.

---

### 2. Employee Management
- [x] **2.1 Add New Employees**: Form with comprehensive client-side and server-side validation.
- [x] **2.2 Auto-Generated Unique ID**: System automatically assigns unique codes (`EMP-1001`, `EMP-1002`, etc.).
- [x] **2.3 Employee Details View**: Modal popup providing complete profile information (personal details, department, designation, joining date, status, base salary).
- [x] **2.4 Update Information**: Pre-populated update form to modify employee details.
- [x] **2.5 Real-Time Search**: Instant filtering by employee name, employee code, or ID.
- [x] **2.6 Multi-Criteria Filtering**: Filter employee directory by **Department** and **Employment Status** (`ACTIVE` vs `INACTIVE`).
- [x] **2.7 Employee Deactivation**: Deactivate staff who leave the organization without deleting historical payroll and attendance data.
- [x] **2.8 Comprehensive Profile Data**: Maintains name, email, phone number, department, designation, joining date, base salary, and active status.

---

### 3. Department Management
- [x] **3.1 Department Creation**: Add organizational departments with name, code (e.g. `ENG`, `HR`, `FIN`), and description.
- [x] **3.2 Department Updates**: Edit department scope, code, or description.
- [x] **3.3 Department Directory**: Grid view of all departments displaying current employee headcount.
- [x] **3.4 Employee Allocation**: Assign or reassign employees to departments via the employee form.
- [x] **3.5 Department Members List**: "View Team" modal listing all staff belonging to a chosen department.
- [x] **3.6 Deletion Safeguard**: Both backend API and frontend prevent deleting departments that currently have active employees assigned.

---

### 4. Attendance Management
- [x] **4.1 Daily Attendance Recording**: Interface to mark daily attendance with status options: `PRESENT`, `ABSENT`, `PAID_LEAVE`, and `UNPAID_LEAVE`.
- [x] **4.2 Date-Based Tracking**: Select any date to view or record presence, with quick "All Present" and "All Absent" batch actions.
- [x] **4.3 Attendance Correction**: Administrators can update historical attendance records with audit logging.
- [x] **4.4 Period Summaries**: Computes Total Logged Days, Days Present, Days Absent, Paid Leaves, Unpaid Leaves, and Attendance Rate (%) per employee.
- [x] **4.5 Status Differentiation**: Distinguishes between present, absent, paid leave, and unpaid leave for payroll integration.
- [x] **4.6 Employee Self-Service**: Employees can inspect their personal daily attendance logs and monthly attendance rates.

---

### 5. Leave Management
- [x] **5.1 Leave Request Submission**: Employees submit time-off requests specifying leave type (Annual, Sick, Casual, Unpaid Leave), start date, end date, and reason.
- [x] **5.2 Status Tracking**: Employees view request status in real time (`PENDING`, `APPROVED`, `REJECTED`).
- [x] **5.3 Conflict & Validation Guard**: Automatically blocks requests with invalid dates (start date after end date) or overlapping requests for the same employee.
- [x] **5.4 Administrative Approval Workflow**: Administrators review pending requests and approve or reject with custom feedback remarks.
- [x] **5.5 Auto-Attendance Sync**: Approving a leave request automatically creates attendance entries (`PAID_LEAVE` or `UNPAID_LEAVE`) for the requested date range.
- [x] **5.6 Decision History**: Preserves full historical audit log of leave decisions and admin comments.

---

### 6. Payroll Management
- [x] **6.1 Salary Structure Configuration**: Configure basic salary, allowances (HRA, Special, Conveyance), and statutory deductions (PF, Professional Tax, Health Insurance).
- [x] **6.2 Gross Salary Computation**: `Gross Salary = Basic Salary + Total Allowances`.
- [x] **6.3 Unpaid Leave Penalty Deduction**: Calculates loss-of-pay deductions dynamically: `(Gross Salary / 30) * Unpaid Leave Days`.
- [x] **6.4 Net Salary Payable**: `Net Salary = Gross Salary - (Configured Deductions + Unpaid Leave Penalties)`.
- [x] **6.5 Monthly Payroll Generation**: Single-click individual or batch generation for all active employees for a given pay cycle (`YYYY-MM`).
- [x] **6.6 Duplicate Prevention**: Prevents duplicate payslip generation for the same employee within the same pay period.
- [x] **6.7 Processing Workflow**: Track status (`PROCESSED` → `PAID`) with payment date recording.
- [x] **6.8 Formatted Printable Payslip**: Standardized payslip modal showing earnings, deductions, net payable amount, and direct print functionality.
- [x] **6.9 Employee Self-Service Payslips**: Logged-in employees can review and print their own monthly payslips.

---

### 7. Reports and Analytics
- [x] **7.1 Headcount Metrics**: Total active employees vs inactive / separated staff.
- [x] **7.2 Department Distribution**: Graphical breakdown of staff counts and percentages per department.
- [x] **7.3 Payroll Expenditure Summary**: Total gross salary, statutory deductions, unpaid penalties, and net payroll expenditure.
- [x] **7.4 Filtering**: Search and filter payroll records by pay period, department, and employee.
- [x] **7.5 One-Click CSV Export**:
  - Export Monthly Payroll Expenditure (`.csv`)
  - Export Employee Directory (`.csv`)
  - Export Raw Attendance Logs (`.csv`)

---

### 8. In-App Notifications
- [x] **8.1 Real-Time Notification Bell**: Bell icon in navbar with dynamic unread badge count.
- [x] **8.2 Admin Notifications**: Alerts administrators when new leave requests are submitted by employees.
- [x] **8.3 Employee Notifications**:
  - Alerts employees when leave requests are approved or rejected.
  - Alerts employees when monthly payslips are generated.
- [x] **8.4 Notification Management**: Click notifications to view details or "Mark all as read".

---

### 9. Audit and Record Management
- [x] **9.1 Administrative Activity Trail**: Dedicated `/audit` log recording employee additions, updates, status toggles, department creation, leave approvals, and payroll runs.
- [x] **9.2 Data Preservation**: Historical payroll and attendance records remain accessible even after employee accounts are deactivated.
- [x] **9.3 Confidential Information Protection**: Regular employees are restricted to self-service data and cannot view company-wide payroll or other staff profiles.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Axios, Bootstrap 5, Bootstrap Icons, Plus Jakarta Sans |
| **Backend** | Spring Boot 3.5+, Spring Data JPA, Hibernate ORM, Lombok |
| **Database** | MySQL 8.x (`jdbc:mysql://localhost:3306/ems`) |

---

## 🔑 Demo Login Credentials

You can use the **1-Click Quick Demo Login** buttons on the login page or enter:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Super Admin** | `admin@ems.com` | `password123` | Full administrative control over all modules |
| **Employee User** | `abc@gmail.com` | `password123` | Employee Self-Service (Attendance, Leaves, Payslips) |

*You can also create a new custom account with your chosen role via the **Sign Up** page.*

---

## ⚙️ Running the Project Locally

### 1. Database Setup
Ensure MySQL is running on `localhost:3306` and initialize the database:
```sql
CREATE DATABASE IF NOT EXISTS ems;
```
*(Database connection settings are configured in [`ems-backend/src/main/resources/application.properties`](file:///d:/Project/ems-fullstack-main/ems-backend/src/main/resources/application.properties))*

### 2. Backend (Spring Boot)
Open a terminal in the project root:
```powershell
cd ems-backend
.\mvnw.cmd spring-boot:run
```
- REST APIs: `http://localhost:8080/api/employees` and `http://localhost:8080/api/departments`

### 3. Frontend (React + Vite)
Open a second terminal:
```powershell
cd ems-frontend
npm install
npm run dev
```
- Application Web Interface: `http://localhost:3000`

---

## 🗺️ Application Routes

| Path | Access Level | Description |
|---|---|---|
| `/login` | Public | Sign In page with 1-Click Role Login |
| `/register` | Public | Account registration |
| `/employees` | Admin | Employee directory with search, filter, status toggle, and delete modal |
| `/add-employee` | Admin | Add new employee with auto-generated ID |
| `/edit-employee/:id` | Admin | Edit employee details |
| `/departments` | Admin | Department management with member view and delete protection |
| `/attendance` | Admin | Daily attendance recording and monthly summaries |
| `/leaves` | Admin | Time-off approval workflow and conflict review |
| `/payroll` | Admin | Salary structure configuration, batch run, and payslips |
| `/reports` | Admin | Headcount, department analytics, and CSV exports |
| `/audit` | Admin | Administrative activity log |
| `/employee-portal` | Employee | Self-service overview and personal salary breakdown |
| `/my-attendance` | Employee | Personal daily attendance log |
| `/my-leaves` | Employee | Submit leave requests and check approval status |
| `/my-payslips` | Employee | View and print personal monthly payslips |
