# Internship Management System

A comprehensive backend system for managing internship postings, applications, and interactions between students, universities, companies, and recruiters.

---

## Overview

The Internship Management System is a multi-tenant platform that enables:

- **Students** to discover, apply for, and track internship opportunities
- **Recruiters** to create postings, review applications, and manage hiring pipelines
- **Company Admins** to manage recruiters and oversee company postings
- **University Admins** to manage students and view internship opportunities
- **Super Admins** to oversee the entire system (companies, universities, and user accounts)

The system uses **JWT-based authentication** with role-based access control (RBAC) to enforce permissions and keep data isolated by company and university boundaries.

---

## Features

### Core Functionality

#### 1. Authentication & Authorization
- User registration (students only)
- Role-based login for all user types
- JWT token-based session management
- Secure token storage and validation
- Current user profile retrieval
- Role-specific dashboard routing

#### 2. User Management
- Create and manage users by role:
  - Super Admin → Company Admin, University Admin
  - Company Admin → Recruiters
  - Students self-register
- Activate/deactivate users
- Role-based access control
- User profile management

#### 3. Company Management
- Create and list companies (Super Admin)
- Update company details (Company Admin)
- Company profile viewing (Company Admin)
- Industry classification
- Website and description tracking

#### 4. University Management
- Create and list universities (Super Admin)
- Update university details (University Admin)
- View university profile (University Admin)
- Location and website tracking

#### 5. Internship Postings
- Create postings with detailed requirements
- Support for multiple posting statuses: `draft`, `open`, `closed`
- Edit and update postings
- Search and filter by skills, location, and mode
- Change posting visibility and status
- Track application deadlines

#### 6. Application Management
- Submit applications with cover letters
- Track application status through the pipeline:
  - `applied` → `under_review` → `shortlisted` / `rejected` → `offered`
- Add recruiter notes during review
- View application history and status timeline

#### 7. Student Features
- Complete and edit profile (name, skills, resume, CGPA, department)
- Browse open internship postings
- Apply with cover letters
- Track application status
- Search postings by skills

#### 8. Recruiter Features
- Create internship postings with full details
- Manage posting status (draft → open → closed)
- Review and evaluate applications
- Update application status and add notes
- View applicant profiles

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT 
- **Password Hashing:** bcrypt
- **Environment:** dotenv

### API Contract
- REST API following standard HTTP methods
- JSON request/response format
- Consistent error handling
- Bearer token authentication

---

## Authentication

### Token Management
- JWT tokens are issued upon successful login or registration
- Tokens must be included in all protected requests via the `Authorization` header:
  ```
  Authorization: Bearer <token>
  ```
- Tokens are validated server-side on every protected request
- Token expiration is enforced (configurable via environment)

### Login Flow
1. User provides email and password
2. Backend validates credentials against hashed password
3. JWT token is generated and returned
4. Frontend stores token in browser storage (localStorage/sessionStorage)
5. Token is attached to all subsequent API requests

### Registration Flow (Students Only)
1. Student provides name, email, password, and universityId
2. Backend validates email uniqueness
3. Password is hashed and stored
4. User record created with `role: 'student'`
5. JWT token is issued immediately
6. Optional fields: rollNumber, department, graduationYear

---

## Role-Based Access Control

### Permission Matrix

| Feature | Super Admin | Company Admin | University Admin | Recruiter | Student |
|---------|-----------|---------------|------------------|-----------|---------|
| Create Company | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create University | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create Company Admin | ✅ | ❌ | ❌ | ❌ | ❌ |
| Create University Admin | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Recruiters | ❌ | ✅ | ❌ | ❌ | ❌ |
| Create Postings | ❌ | ❌ | ❌ | ✅ | ❌ |
| Review Applications | ❌ | ❌ | ❌ | ✅ | ❌ |
| View All Users | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Students | ❌ | ❌ | ✅ | ❌ | ❌ |
| Browse Postings | ❌ | ❌ | ✅ | ✅ | ✅ |
| Apply to Postings | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Own Applications | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Key Business Logic

### Data Isolation
- **Company Admin** can only access their own company and its recruiters/postings
- **University Admin** can only access their own university and its students
- **Recruiter** can only create and manage postings for their assigned company
- **Student** can only view their own profile and applications

### Application Status Workflow
```
applied → under_review → shortlisted → offered
                      ↓
                    rejected
```

### Posting Visibility
- **Draft postings**: Only visible to recruiters who created them
- **Open postings**: Visible to students and university admins
- **Closed postings**: Not visible to students or university admins (historical access for recruiters only)

### User Activation
- Super Admin can activate/deactivate any user
- Company Admin can activate/deactivate recruiters in their company
- University Admin can activate/deactivate students in their university
- Deactivated users cannot log in

---

## Error Handling

All endpoints follow a consistent error response format.

### Common HTTP Status Codes
- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input or missing required fields
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions for the requested action
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **500 Internal Server Error**: Server-side error

---
