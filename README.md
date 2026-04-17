# QMS Suite — ISO 17025:2017
### Spring Boot 3 + Angular 17 + PrimeNG + PostgreSQL 16

---

## Quick Start

### Option A — Docker Compose (recommended)
```bash
docker compose up --build
```
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### Option B — Run locally

**1. PostgreSQL**
```bash
createdb qmsdb
createuser qmsuser -P   # password: qmspass
```

**2. Backend**
```bash
cd qms-backend
mvn spring-boot:run
```

**3. Frontend**
```bash
cd qms-frontend
npm install --legacy-peer-deps
ng serve
```

---

## Login
| Username | Password  | Role    |
|----------|-----------|---------|
| admin    | Admin@123 | Admin   |
| ravi     | Admin@123 | Analyst |
| arjun    | Admin@123 | Auditor |
| mohan    | Admin@123 | Manager |

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Angular 17 (standalone), PrimeNG 17, PrimeFlex |
| State      | Angular Signals                     |
| Backend    | Spring Boot 3.2, Spring Security    |
| Auth       | JWT (jjwt 0.12)                     |
| ORM        | Spring Data JPA + Hibernate 6       |
| Database   | PostgreSQL 16                       |
| Migrations | Flyway                              |
| PDF        | iText 8                             |
| API Docs   | SpringDoc OpenAPI 3                 |
| Build      | Maven 3.9, Node 20, Angular CLI 17  |
| Container  | Docker + Docker Compose             |

---

## Project Structure

```
qms-suite/
├── docker-compose.yml
├── qms-backend/
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/main/java/com/qmssuite/
│       ├── QmsApplication.java
│       ├── shared/          ← BaseEntity, ApiResponse, AuditTrail
│       ├── auth/            ← JWT login, users, roles
│       ├── documents/       ← Clause 8.3
│       ├── equipment/       ← Clause 6.4
│       ├── personnel/       ← Clause 6.2
│       ├── testing/         ← Clause 7.5–7.7
│       ├── quality/         ← Clause 8.5–8.8
│       └── reports/         ← Clause 7.8
└── qms-frontend/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── styles.scss
        ├── environments/
        └── app/
            ├── app.config.ts
            ├── app.routes.ts
            ├── core/auth/      ← AuthService, JWT interceptor, Guard
            ├── core/api/       ← ApiService
            ├── layout/         ← Shell, Sidebar, Topbar
            └── features/       ← One folder per module
```

---

## API Endpoints

| Method | Path                    | Description              |
|--------|-------------------------|--------------------------|
| POST   | /api/auth/login         | Get JWT token            |
| GET    | /api/documents          | List/search documents    |
| POST   | /api/documents          | Create/update document   |
| GET    | /api/documents/stats    | Document KPIs            |
| GET    | /api/equipment          | List/search equipment    |
| POST   | /api/equipment          | Save equipment           |
| GET    | /api/equipment/stats    | Equipment KPIs           |
| GET    | /api/dashboard/stats    | Aggregated dashboard KPIs|

Full API docs at: http://localhost:8080/swagger-ui.html

---

## ISO 17025 Module Status

| Module              | Clause      | Backend | Frontend |
|---------------------|-------------|---------|----------|
| Auth & Users        | 8.1         | ✅       | ✅        |
| Document Control    | 8.3         | ✅       | ✅        |
| Equipment & Cal.    | 6.4         | ✅       | ✅        |
| Personnel           | 6.2         | 🔧       | 🔧        |
| Test Records        | 7.5         | 🔧       | 🔧        |
| Uncertainty (GUM)   | 7.6         | 🔧       | 🔧        |
| Proficiency Testing | 7.7         | 🔧       | 🔧        |
| Audit & CAPA        | 8.6–8.8     | 🔧       | 🔧        |
| Reports & PDF       | 7.8         | 🔧       | 🔧        |
| Risk Management     | 8.5         | 🔧       | 🔧        |

✅ Fully implemented  🔧 Scaffold ready — implementation in progress
