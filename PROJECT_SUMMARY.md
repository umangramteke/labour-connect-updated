# LABOUR CONNECT — COMPREHENSIVE PROJECT SUMMARY & DOCUMENTATION
**Web Technology (WT) Academic Project**

---

### Student & Project Metadata
- **Project Team:**
  1. Prince Bansal (PRN: 202401100064)
  2. Pankaj Bharsakle (PRN: 202401100067)
  3. Umang Ramteke (PRN: 202401100068)
  4. Ayush Dudhe (PRN: 202401100073)
- **Project Guide:** Mrs. Nita Gore
- **Project Coordinator:** Mrs. Nita Gore
- **Dean / Head of Department:** Dr. Manish Giri
- **Department:** Department of Computer Engineering (Software Engineering)
- **Institute:** MIT Academy of Engineering, Alandi (D), Pune (Affiliated to Savitribai Phule Pune University)
- **Degree:** Third Year Bachelor of Technology in Computer Engineering (Software Engineering)
- **Project Title:** Labour Connect — Blue-Collar Employment & On-Demand Hyperlocal Trade Services Platform
- **Course:** Web Technology (WT) Laboratory / Project Submission (Course Code: 2310362L)
- **Academic Year:** 2026 – 2027
- **Architecture:** MERN-Equivalent Modern Full Stack (MongoDB, Express.js, React 18, Node.js)
- **Previous Architecture (Preserved as Backup):** Java 17 + Spring Boot 3 + Hibernate / JPA + MySQL
- **Live Frontend URL:** [https://labour-connect-updated.vercel.app/](https://labour-connect-updated.vercel.app/)
- **Live Backend REST API:** [https://labour-connect-updated.onrender.com/api/v1](https://labour-connect-updated.onrender.com/api/v1)
- **Cloud Database:** MongoDB Atlas (AWS Mumbai `ap-south-1` Cluster)
- **GitHub Repository:** [https://github.com/umangramteke/labour-connect-updated](https://github.com/umangramteke/labour-connect-updated)
- **Submission Date:** Academic Year 2026–2027

---

## 1. Executive Summary

**Labour Connect** is a centralized, digital employment and on-demand local services platform designed specifically for the unorganized blue-collar workforce and local skilled tradespeople in India. 

The application bridges the critical trust and access gap between:
1. **Daily-Wage & Contract Workers** (e.g., Masons, Carpenters, Welders, Painters, Retail Staff, Security Guards) and **Industrial/Commercial Employers**.
2. **Certified Trade Service Contractors** (e.g., Plumbers, Electricians, Appliance Technicians, Home Cleaners) and **Residential/Commercial Customers**.
3. **Platform Administrators** who audit compliance, approve trade verification licenses, resolve disputes, and maintain platform security.

Following academic guidance from the faculty mentor ("Ma'am"), the entire server architecture was migrated from a legacy relational database and Java backend to **MongoDB** (NoSQL Document Store) and **Node.js with Express.js**, while **preserving 100% of the React frontend UI design, user experience, CSS layouts, and visual components**.

---

## 2. High-Level System Architecture

```mermaid
graph TD
    subgraph Client Tier ["Frontend Client Tier (React 18 + Vite + Tailwind CSS)"]
        UI_Home["Landing & Discovery Pages"]
        UI_Auth["JWT Auth & Role Gatekeeper"]
        UI_Dashboards["Role Dashboards (Admin / Employer / Worker / Customer / Provider)"]
        UI_Modals["Booking, Dispute & Review Modals"]
    end

    subgraph API Gateway ["REST API Gateway (Node.js + Express on Port 8081)"]
        MW_Cors["CORS & Helmet Security"]
        MW_Auth["JWT Authentication Middleware"]
        MW_RBAC["Role-Based Access Control (RBAC)"]
        MW_Log["Audit Logger & Event Tracker"]
    end

    subgraph Service Tier ["Backend Business Logic (Express Controllers)"]
        Ctrl_Auth["Auth & Security Controller"]
        Ctrl_Job["Jobs & Applications Controller"]
        Ctrl_Service["Service Requests Controller"]
        Ctrl_Profile["Profiles & Ratings Controller"]
        Ctrl_Admin["Admin & Dispute Controller"]
    end

    subgraph Persistence Tier ["Data Tier (MongoDB on Port 27017)"]
        DB_Users[("users & roles")]
        DB_Profiles[("worker / employer / customer / provider profiles")]
        DB_Jobs[("jobs & jobapplications")]
        DB_Services[("servicerequests & servicecategories")]
        DB_Reviews[("reviews & complaints")]
        DB_Counters[("counters (Atomic Sequences)")]
    end

    Client Tier -->|HTTP/REST with JWT Bearer Token| API Gateway
    API Gateway --> Service Tier
    Service Tier -->|Mongoose ODM Queries & Aggregations| Persistence Tier
```

---

## 3. Technology Stack & Component Comparison

| Component | Original Technology | Migrated Modern Technology | Reason & Benefit |
|---|---|---|---|
| **Database** | MySQL 8.0 (Relational) | **MongoDB 8.3** (Document Store) | Highly flexible JSON-like documents, native support for nested arrays (skills, categories), fast indexing, dynamic schema evolution. |
| **Data Access Layer** | Spring Data JPA / Hibernate | **Mongoose ODM 8.20** | Strict schema validation, atomic sequence generators, pre-save hooks, efficient query filtering. |
| **Backend Framework** | Java 17 + Spring Boot 3.2 | **Node.js 24 + Express 4.19** | Asynchronous non-blocking I/O, lightweight memory footprint, native JSON serialization matching frontend formats. |
| **Authentication** | Spring Security + JJWT | **JSON Web Tokens (JWT) + Bcrypt** | Stateless authentication, standard Bearer token exchange, secure salted password hashing. |
| **Frontend Framework** | React 18.3 + Vite 5.4 | **React 18.3 + Vite 5.4** | Unchanged: fast hot-module replacement (HMR), component-driven UI. |
| **Styling & Icons** | Tailwind CSS + Lucide Icons | **Tailwind CSS + Lucide Icons** | Unchanged: modern responsive utility classes, clean aesthetic. |
| **API Port** | `8081` | `8081` | Zero configuration changes required in frontend `.env`. |

---

## 4. Complete Database Design & Collections

MongoDB represents data as BSON documents. To maintain strict parity with existing numeric IDs (`id: 1, 2, ...`), an atomic sequence collection (`counters`) was implemented using Mongoose `$inc`.

### Collections Overview:
1. **`users`**: Core user authentication entity storing `id`, `email`, `passwordHash`, `fullName`, `phoneNumber`, `roles` array (`ROLE_ADMIN`, `ROLE_EMPLOYER`, `ROLE_WORKER`, `ROLE_CUSTOMER`, `ROLE_PROVIDER`), `active`, and `suspended`.
2. **`roles`**: System role lookup collection.
3. **`skills`**: Master taxonomy of 14 skills covering construction, carpentry, plumbing, retail customer service, industrial warehousing, and electrical engineering.
4. **`servicecategories`**: Master directory of 6 on-demand trade service categories (Plumbing, Electrical, Carpentry, Painting, Appliance Repair, Cleaning).
5. **`workerprofiles`**: Stores worker headline, bio, experience, daily/hourly wage rates, city, coordinates, availability status (`AVAILABLE`, `BUSY`, `UNAVAILABLE`), and referenced `skillIds`.
6. **`employerprofiles`**: Stores company name, business type, contact person, phone, city, and address.
7. **`customerprofiles`**: Stores residential service delivery address, city, and geolocation coordinates.
8. **`providerprofiles`**: Stores business name, years of experience, base call-out rate, hourly rate, trade license/ID proof URL, verification status (`PENDING`, `APPROVED`, `REJECTED`), and assigned `categoryIds`.
9. **`jobs`**: Job postings by employers storing title, description, `jobType` (`DAILY_WAGE` or `REGULAR`), salary/wage ranges, working hours, duration, location, `status` (`OPEN`, `PAUSED`, `CLOSED`), and `requiredSkillIds`.
10. **`jobapplications`**: Worker job applications storing `jobId`, `workerId`, `bidAmount`, `coverNote`, applied timestamp, and `status` (`APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`).
11. **`servicerequests`**: On-demand bookings storing `customerId`, `providerId`, `categoryId`, title, address, scheduled time, estimated cost, final cost, and lifecycle status (`REQUESTED` &rarr; `ACCEPTED` &rarr; `ON_THE_WAY` &rarr; `SERVICE_STARTED` &rarr; `COMPLETED` / `CANCELLED` / `REJECTED`).
12. **`reviews`**: 1-to-5 star ratings and textual feedback linked to users, jobs, or completed service requests.
13. **`complaints`**: Dispute resolution tickets tracking complainant, reported user, incident details, and administrative resolution notes.
14. **`auditlogs`**: Comprehensive immutable platform security trail logging every critical action (`REGISTER`, `LOGIN`, `CREATE_JOB`, `VERIFY_PROVIDER`, `RESOLVE_COMPLAINT`).
15. **`counters`**: Atomic sequence collection managing autoincrement counters for all relational-style numeric primary keys.

---

## 5. Security & Access Control (RBAC) Matrix

Every incoming request is verified by `authMiddleware.js`. If valid, the user identity is populated onto `req.user`. Then `rbac.js` enforces fine-grained authorization:

| API Group / Action | Public | Worker | Employer | Customer | Provider | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `POST /auth/register` & `login` | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; |
| `GET /jobs?status=OPEN` | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; |
| `POST /jobs/:id/apply` | &#10008; | &#10004; | &#10008; | &#10008; | &#10008; | &#10008; |
| `POST /jobs` & `DELETE /jobs/:id` | &#10008; | &#10008; | &#10004; | &#10008; | &#10008; | &#10008; |
| `PUT /jobs/applications/:id/status` | &#10008; | &#10008; | &#10004; | &#10008; | &#10008; | &#10008; |
| `POST /requests` (Book Service) | &#10008; | &#10008; | &#10008; | &#10004; | &#10008; | &#10008; |
| `PUT /requests/:id/status` | &#10008; | &#10008; | &#10008; | &#10008; | &#10004; | &#10008; |
| `POST /reviews` | &#10008; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; |
| `POST /complaints` | &#10008; | &#10004; | &#10004; | &#10004; | &#10004; | &#10004; |
| `GET /admin/*` (Stats, Users, Verifications) | &#10008; | &#10008; | &#10008; | &#10008; | &#10008; | &#10004; |
| `POST /categories` (Create Category) | &#10008; | &#10008; | &#10008; | &#10008; | &#10008; | &#10004; |

---

## 6. Frontend UI Modules (100% Unchanged)

The frontend remains completely intact, styled with Tailwind CSS and powered by React 18:
1. **Public Landing & Discovery:**
   - **`HomePage.jsx`**: Hero section with quick role selection, featured jobs, and top trade categories.
   - **`JobBrowsePage.jsx`**: Multi-filter job search (Regular Monthly vs Daily-Wage, City, Skill, Salary).
   - **`ServiceDiscoveryPage.jsx`**: Nearby verified contractor discovery with distance calculation and booking modal.
2. **Authentication Pages:**
   - **`LoginPage.jsx` & `RegisterPage.jsx`**: Multi-role onboarding with validation and demo auto-fill.
3. **Employer Workflow:**
   - **`EmployerDashboard.jsx`**: Active jobs count, applicants pending review, and quick actions.
   - **`PostJobPage.jsx`**: Form for creating daily-wage or regular employment vacancies.
   - **`ManageJobsPage.jsx`**: Filterable applicant review modal with Shortlist, Hire/Accept, and Reject actions.
   - **`WorkerSearchPage.jsx`**: Direct searchable directory of skilled workers.
4. **Worker Workflow:**
   - **`WorkerDashboard.jsx`**: Application status updates, earnings statistics, and profile visibility toggle.
   - **`WorkerApplicationsPage.jsx`**: Track bid status and hired notifications.
   - **`WorkerProfilePage.jsx`**: Edit trade skills, bio, and daily/hourly wage expectations.
5. **Customer Workflow:**
   - **`CustomerDashboard.jsx`**: Active service bookings overview.
   - **`CustomerRequestsPage.jsx`**: 5-step lifecycle progress bar (`REQUESTED` &rarr; `ACCEPTED` &rarr; `ON THE WAY` &rarr; `STARTED` &rarr; `COMPLETED`), cancellation with reason, and review modal.
6. **Provider Workflow:**
   - **`ProviderDashboard.jsx`**: Incoming booking alerts, revenue metrics, and availability switch.
   - **`ProviderRequestsPage.jsx`**: Order processing, dispatch status updates, and completion billing.
   - **`ProviderVerificationPage.jsx`**: Upload ID credentials to receive the verified badge.
7. **Administrator Workflow:**
   - **`AdminDashboard.jsx`**: 5-tab control room:
     - *Overview Stats:* Total users, open jobs, completed requests, pending verifications.
     - *User Management:* Activate, deactivate, or suspend users with compliance reason logging.
     - *Verification Approvals:* Review provider trade licenses and approve/reject badges.
     - *Categories Catalog:* View and create service categories with auto-slug generation.
     - *Disputes / Complaints:* Investigate user disputes and record administrative resolutions.
     - *Audit Logs:* Live searchable security event stream.

---

## 7. Critical Bugs Audited & Fixed

During systematic integration testing of all frontend pages against the Node/MongoDB backend, 4 subtle contract bugs were discovered and resolved:

```
[BUG 1: Job Owner Identification]
Problem: On JobDetailsPage, employers could not see the "Manage Applicants" button on their own jobs.
Root Cause: Frontend evaluated (user.id === job.employerUserId), but backend Job DTO only returned job.employerId.
Fix: Added employerUserId: employer ? employer.userId : null in mapJobToDto().

[BUG 2: Provider Booking Category Fallback]
Problem: In ServiceDiscoveryPage, opening the booking modal caused undefined category IDs if no search filter was active.
Root Cause: Frontend read provider.categories?.[0]?.id, but the backend only returned categoryIds as an array of numbers.
Fix: Added categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })) in mapProviderToDto().

[BUG 3: Admin Category Creation Failure]
Problem: Admin category creation failed with HTTP 400 Bad Request.
Root Cause: Frontend modal submitted only { name, description }. The backend strictly demanded an explicit slug in req.body.
Fix: Implemented automated slug generation in categoryController.js matching Spring Boot's logic.

[BUG 4: Provider ID Ambiguity in Requests]
Problem: Submitting a service request failed if a component passed user ID instead of profile ID.
Root Cause: Backend only searched ProviderProfile by profile id.
Fix: Updated serviceRequestController.js to gracefully resolve providers by either profile id or userId.
```

---

## 8. Quality Assurance & Verification Results

### Automated Backend Test Suite (Node.js Test Runner + Supertest)
Command: `npm --prefix backend test`

| # | Test Scenario | Verified Endpoints | Status |
|:---:|---|---|:---:|
| 1 | Health Check & Database Connectivity | `GET /api/v1/health` | **PASSED** |
| 2 | Service Categories Catalog | `GET /api/v1/categories` | **PASSED** |
| 3 | Trade & Employment Skills Master Data | `GET /api/v1/skills` | **PASSED** |
| 4 | Authentication for 5 User Roles | `POST /api/v1/auth/login` | **PASSED** |
| 5 | Jobs Search & Regular Employment Filter | `GET /api/v1/jobs` | **PASSED** |
| 6 | Verified Service Providers Search | `GET /api/v1/services/providers` | **PASSED** |
| 7 | Admin Stats & RBAC Security (401/403) | `GET /api/v1/admin/stats` | **PASSED** |
| 8 | Worker Application Tracking | `GET /api/v1/jobs/applications/my-applications` | **PASSED** |
| 9 | Profile Management (Worker & Employer) | `GET/PUT /api/v1/profiles/*` | **PASSED** |
| 10 | Service Booking Creation & Acceptance | `POST /api/v1/requests`, `PUT /requests/:id/status` | **PASSED** |
| 11 | Job Post & Applicant Review Flow | `POST /jobs`, `PUT /applications/:id/status`, `DELETE /jobs/:id` | **PASSED** |
| 12 | Complete Service Lifecycle & Review | Full 5-step status transition + `POST /reviews` | **PASSED** |
| 13 | Service Cancellation with Reason | `POST /api/v1/requests/:id/cancel` | **PASSED** |
| 14 | Dispute Filing & Admin Resolution | `POST /complaints`, `PUT /admin/complaints/:id` | **PASSED** |
| 15 | Category Creation with Auto-Slug | `POST /api/v1/categories` | **PASSED** |
| 16 | Admin User Suspension & Reactivation | `PUT /admin/users/:id/status`, `POST /auth/login` | **PASSED** |

**Summary:** **16 of 16 tests PASSED in ~2.6 seconds (0 failures, 0 regressions).**

### Production Frontend Build Verification
Command: `npm --prefix frontend run build`

```text
vite v5.4.21 building for production...
transforming...
✓ 1672 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.06 kB │ gzip:   0.59 kB
dist/assets/index-BUMCPF61.css   38.38 kB │ gzip:   6.83 kB
dist/assets/index-Cmd1S9ba.js   488.15 kB │ gzip: 125.53 kB
✓ built in 3.56s with 0 errors
```

---

## 9. Quick Start, Execution & Operations Guide

### Pre-requisites
- **Node.js**: v18.x, v20.x, or v24.x (`node -v`)
- **MongoDB**: Community Server v6.0+ or v8.0+ running on `localhost:27017`

### 1-Click Launch & Stop (Windows)
The project includes automated batch scripts in the root directory:
- **To Start:** Double-click [`start-app.bat`](file:///c:/Users/ramte/OneDrive/Desktop/labour%20connect%20updated/start-app.bat).
  - Starts MongoDB service if stopped.
  - Launches the Node.js Express backend in a new window on port `8081`.
  - Launches the React frontend in a new window on port `5173`.
  - Automatically launches `http://localhost:5173` in your default web browser.
- **To Stop:** Double-click [`stop-app.bat`](file:///c:/Users/ramte/OneDrive/Desktop/labour%20connect%20updated/stop-app.bat).
  - Immediately terminates background processes on ports `8081` and `5173`.

### Manual Terminal Execution

```powershell
# 1. Seed Database (Optional / First Run)
cd backend
npm run seed

# 2. Start Backend Server (Terminal 1)
cd backend
npm start
# Server listens at: http://localhost:8081/api/v1

# 3. Start Frontend Development Server (Terminal 2)
cd frontend
npm run dev
# Vite runs at: http://localhost:5173
```

---

## 10. Demo Credentials for Evaluation

All test accounts are pre-seeded in the database:

| Role | Email Address | Password | Key Feature to Demo |
|---|---|---|---|
| **Platform Admin** | `admin@labourconnect.com` | `Admin@1234` | Verification approvals, category creation, dispute resolution, user suspension. |
| **Employer** | `employer@labourconnect.com` | `Employer@1234` | Post regular/daily-wage jobs, view applicants, Shortlist / Hire workers, close jobs. |
| **Skilled Worker** | `worker@labourconnect.com` | `Worker@1234` | Search jobs, bid on open vacancies, view application statuses, edit profile & skills. |
| **Customer** | `customer@labourconnect.com` | `Customer@1234` | Discover nearby verified providers, book services, track 5-step lifecycle, submit reviews. |
| **Service Provider**| `provider@labourconnect.com` | `Provider@1234` | Accept/decline service orders, update progress (`ON_THE_WAY`, `COMPLETED`), view earnings. |

---

## 11. Project Directory Structure

```text
labour connect updated/
├── start-app.bat                             # 1-Click launcher for Backend, Frontend & Browser
├── stop-app.bat                              # 1-Click shutdown script for ports 8081 and 5173
├── PROJECT_SUMMARY.md                        # Complete project documentation and report (This File)
├── README.md                                 # Developer readme and instructions
├── 202401100064_Prince_Project.pdf           # Original project report document
├── 202401100064_Prince_Bansal_Project_Updated.zip # Final submission archive
│
├── backend/                                  # Node.js + Express + MongoDB Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                         # Mongoose MongoDB connection
│   │   │   └── seedData.js                   # Seed script (Roles, Skills, Categories, Users, Jobs)
│   │   ├── controllers/                      # 11 REST Controllers (Auth, Jobs, Services, Admin, etc.)
│   │   ├── middleware/                       # JWT Auth, RBAC, Error Handler
│   │   ├── models/                           # 15 Mongoose Models & Sequence Counter
│   │   ├── routes/                           # 11 Express Routers mapped to /api/v1/*
│   │   ├── utils/                            # Pagination, Haversine, ApiResponse, AuditLogger
│   │   └── server.js                         # Express entrypoint on port 8081
│   ├── tests/
│   │   └── api.test.js                       # 16 Automated end-to-end unit & integration tests
│   ├── package.json                          # Dependencies: express, mongoose, bcrypt, jsonwebtoken, etc.
│   └── .env                                  # Configuration (PORT=8081, MONGO_URI, JWT_SECRET)
│
├── frontend/                                 # React 18 + Vite Frontend (UI 100% Preserved)
│   ├── src/
│   │   ├── components/common/                # Reusable UI widgets (Navbar, Footer, Modal, Badge, etc.)
│   │   ├── context/                          # AuthContext, ToastContext
│   │   ├── features/                         # Admin, Jobs, Services, Workers, Employers, Customers, Reviews
│   │   ├── layouts/                          # MainLayout, DashboardLayout
│   │   ├── pages/                            # HomePage, LoginPage, RegisterPage, etc.
│   │   ├── services/api.js                   # Axios client pointing to http://localhost:8081/api/v1
│   │   └── routes/                           # React Router with ProtectedRoute RBAC guards
│   ├── package.json
│   └── vite.config.js
│
├── database/                                 # Database Utilities & Backups
│   ├── backups/                              # JSON dumps of all 17 collections
│   ├── export-mongo.js                       # Automated MongoDB exporter
│   ├── import-mongo.js                       # Automated MongoDB restore tool
│   ├── setup-mongodb.ps1                     # PowerShell seed runner
│   └── backup-mongodb.ps1                    # PowerShell backup tool
│
└── backend-spring/                           # Original Spring Boot Backend (Archived for Reference)
```

---

## 12. Conclusion

The Labour Connect platform has been successfully modernized from a legacy monolithic Java Spring architecture to a high-performance **MongoDB + Node.js + Express** stack. All functional requirements, state transitions, security layers, and data validation rules have been rigorously verified through 16 automated integration tests. Most importantly, the student's primary requirement has been completely satisfied: **the frontend visual appearance, layouts, styles, and responsive design are 100% identical and unchanged**.
