# Financial Analytics Dashboard

![Python](https://img.shields.io/badge/Python-3.11-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-blue)
![License](https://img.shields.io/badge/license-MIT-green)

A full-stack financial analytics dashboard for multi-tenant organizations. The platform combines secure authentication, role-based access control, financial record management, and analytics visualizations so teams can track performance, collaborate through invites, and export data efficiently.

## Quick Start

```bash
git clone <your-repository-url>
cd Zorvyn

cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

cd ../frontend
npm install
npm run dev
```

## Features

- Authentication and authorization with JWT access tokens and refresh tokens
- Multi-organization support for isolated tenant workspaces
- Invite-based organization membership management
- Role-based access control for Admin, Analyst, and Viewer users
- Financial record creation, editing, filtering, and deletion
- Interactive analytics dashboard with charts and trends
- CSV export for financial records
- Notification system for organization activity
- Modern frontend experience with responsive UI and animated interactions

## System Architecture

The application follows a clean three-tier architecture:

```text
Client → React Frontend → FastAPI Backend → PostgreSQL (Supabase)
```

### Frontend

The React application provides the user interface for authentication, organization management, records, dashboard analytics, invitations, and notifications. It communicates with the backend through Axios and manages server state with React Query.

### Backend

FastAPI serves the REST API, handles authentication, enforces RBAC, manages organization membership, processes financial records, and produces analytics responses. SQLAlchemy and Alembic power persistence and schema migrations.

### Database

PostgreSQL stores users, organizations, memberships, invites, records, categories, notifications, and refresh tokens. In production, the database is hosted on Supabase PostgreSQL.

### Authentication and RBAC Flow

1. The user signs in through the frontend.
2. The backend issues a short-lived access token and a refresh token.
3. Requests include the access token for authorization.
4. RBAC middleware verifies the user role for the target organization before allowing sensitive actions.
5. Analytics endpoints aggregate data within the active organization context.

## Technology Stack

### Frontend

| Technology | Purpose |
| --- | --- |
| React | UI framework |
| TypeScript | Type-safe frontend development |
| Tailwind CSS | Utility-first styling |
| React Query | Server state management |
| Axios | HTTP client |
| Framer Motion | UI animations |
| Recharts | Analytics charts and visualizations |

### Backend

| Technology | Purpose |
| --- | --- |
| FastAPI | API framework |
| SQLAlchemy | ORM and query layer |
| Alembic | Database migrations |
| JWT | Authentication tokens |
| Refresh tokens | Session renewal |
| RBAC | Role-based authorization |
| PostgreSQL | Primary relational database |

### Deployment

| Service | Purpose |
| --- | --- |
| Vercel | Frontend hosting |
| Render | Backend hosting |
| Supabase PostgreSQL | Managed database hosting |

## Installation Guide

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd Zorvyn
```

### 2. Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure backend environment variables

Create a `backend/.env` file from `backend/.env.example` and set the required values.

### 4. Run database migrations

```bash
alembic upgrade head
```

### 5. Start the FastAPI server

```bash
uvicorn app.main:app --reload
```

### 6. Install frontend dependencies

Open a second terminal:

```bash
cd frontend
npm install
```

### 7. Configure frontend environment variables

Create a `frontend/.env` file from `frontend/.env.example` and point it to your backend API.

### 8. Start the React development server

```bash
npm run dev
```

## Environment Variables

### Backend

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime in minutes |
| `REFRESH_TOKEN_EXPIRE_HOURS` | Refresh token lifetime in hours |
| `ENVIRONMENT` | Application environment such as `production` or `development` |

### Frontend

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Base URL of the deployed backend API |

## API Overview

The API is organized by domain. The most important groups are:

- `POST /auth/login` and `POST /auth/register` for user authentication and account creation
- `POST /organizations` for creating organizations
- `GET /records` and `POST /records` for financial record management
- `GET /dashboard/summary` and related dashboard endpoints for analytics
- `GET /notifications` for user notifications
- invite and membership endpoints for managing organization access and roles

### Endpoint Groups

#### Authentication

Handles login, registration, token refresh, and authenticated session bootstrap.

#### Organizations

Supports organization creation and retrieving the organizations a user belongs to.

#### Records

Supports CRUD operations for financial records, category resolution, filtering, and CSV export.

#### Dashboard

Provides aggregated analytics such as summaries, trends, category breakdowns, and top transactions.

#### Notifications

Returns user notifications related to organization activity and collaboration events.

## Role Based Access Control

### Viewer

- Can view dashboard analytics
- Can inspect permitted organization data
- Cannot manage members or mutate financial records

### Analyst

- Can view and manage financial records
- Can access analytics dashboards and exports
- Cannot manage organization membership or roles

### Admin

- Can manage members, roles, and invites
- Can create and update records
- Can manage organization-level settings and access control

## Dashboard Analytics

The dashboard surfaces organization-level financial insights using aggregated queries and chart components.

Available analytics include:

- Income vs expense summaries
- Cashflow trends
- Category breakdowns
- Weekly spending analysis
- Largest transactions
- Top expense categories

These metrics are calculated per organization so each tenant only sees its own data.

## Folder Structure

```text
backend/
frontend/
migrations/
```

- `backend/` contains the FastAPI application, service layer, schemas, database models, and Alembic configuration
- `frontend/` contains the React application, UI components, pages, hooks, services, and styling
- `migrations/` contains Alembic migration scripts for database schema changes

## Screenshots

Add screenshots here when available.

- Dashboard
- Records page
- Members management
- Organization creation modal

## Deployment

The project is deployed across three managed services:

- Frontend on Vercel
- Backend on Render
- Database on Supabase PostgreSQL

### Frontend Deployment

1. Connect the repository to Vercel.
2. Set the project root to `frontend/`.
3. Configure `VITE_API_URL` to point to the Render backend URL.
4. Build command: `npm run build`
5. Output directory: `dist`

### Backend Deployment

1. Connect the repository to Render.
2. Set the project root to `backend/`.
3. Add the backend environment variables.
4. Use migrations during startup with `alembic upgrade head`.
5. Start the service with Uvicorn on the port provided by Render.

### Database Deployment

1. Create a PostgreSQL database in Supabase.
2. Copy the connection string into `DATABASE_URL`.
3. Run Alembic migrations before serving traffic.

## Future Improvements

- Real-time analytics updates
- Mobile-first dashboard optimization
- WebSocket notifications
- Advanced financial report generation
- Bulk import workflows for records
- Enhanced audit logging

## License

This project is licensed under the MIT License.
