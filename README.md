# Finova

A multi-tenant financial analytics backend built with FastAPI, PostgreSQL, and RBAC.

## Project Overview

Finova is a production-style backend for organization-based financial operations and insights. It supports secure authentication, role-based authorization, invite-driven collaboration, financial record lifecycle management, and analytical dashboards.

## Architecture

- FastAPI backend for HTTP API routing and dependency injection
- PostgreSQL database for persistent transactional and membership data
- SQLAlchemy ORM with service-layer architecture for clean separation of concerns
- RBAC middleware for permission checks across organization resources
- JWT authentication with refresh-token support for secure user sessions

## Role Permissions

Viewer
- Can access dashboard analytics only.

Analyst
- Can view financial records and analytics insights.

Admin
- Can manage financial records, users, and organization members.

## API Endpoints

Auth
- Login, token refresh, and user authentication workflows

Organizations
- Organization creation and user organization listing

Invites
- Invite users, list pending invites, accept/reject invite responses

Membership
- List members, update roles, and revoke membership

Records
- Create, list, read, update, delete financial records
- Export records as CSV via `/records/export`

Dashboard
- Summary and advanced analytics endpoints for organization-level insights

Notifications
- List notifications for the authenticated user

## Dashboard Analytics

The dashboard endpoints are built using SQLAlchemy aggregation queries (`sum`, `count`, `date_trunc`, `case`, `group_by`, `order_by`, `limit`) scoped by organization and excluding soft-deleted records.

Available analytics endpoints:
- summary
- category breakdown
- monthly trends
- weekly trends
- cashflow
- top expenses
- largest transactions
- savings rate

## Setup Instructions

1. Clone the repository.

```bash
git clone <your-repo-url>
cd Zorvyn
```

2. Create and activate a virtual environment (optional but recommended).

```bash
python -m venv venv
source venv/bin/activate
```

3. Install dependencies.

```bash
pip install -r backend/requirements.txt
```

4. Create a `.env` file in `backend/` with database and JWT settings.

5. Run database migrations.

```bash
cd backend
alembic upgrade head
```

6. Start the FastAPI server.

```bash
uvicorn app.main:app --reload
```

## Deployment

- Backend deployed on Render
- Database hosted on Supabase PostgreSQL

## Features

- JWT authentication
- Role-based access control
- Organization multi-tenancy
- Invite-based membership system
- Financial records CRUD
- Analytics dashboard APIs
- CSV export functionality
- Notification system
