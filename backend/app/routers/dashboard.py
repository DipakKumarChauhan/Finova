"""
Dashboard Routes

Provides HTTP endpoints for organization financial analytics.
All endpoints are read-only and require 'viewer' role or higher.

Endpoints include:
- Summary metrics (income, expense, balance)
- Category breakdown
- Trend analysis (monthly, weekly, cashflow)
- Top spending categories
- Largest transactions
- Savings rate calculation

All requests require org_id parameter for multi-tenant isolation.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.db.session import get_db
from app.middleware.rbac import require_role
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def summary(
    org_id: UUID,
    db: Session = Depends(get_db),
    # RBAC enforcement: viewer and above can access analytics
    membership = Depends(require_role("viewer"))
):

    return dashboard_service.get_summary(db, org_id)

@router.get("/category-breakdown")
def category_breakdown(
    org_id: UUID,
    db: Session = Depends(get_db),
    # Read-only analytics access for viewers and above
    membership = Depends(require_role("viewer"))
):

    return dashboard_service.category_breakdown(db, org_id)

@router.get("/monthly-trends")
def monthly_trends(
    org_id: UUID,
    db: Session = Depends(get_db),
    # Trend analysis limited to viewers (read-only)
    membership = Depends(require_role("viewer"))
):

    return dashboard_service.monthly_trends(db, org_id)

@router.get("/recent")
def recent_transactions(
    org_id: UUID,
    db: Session = Depends(get_db),
    # View recent activity
    membership = Depends(require_role("viewer"))
):

    return dashboard_service.recent_transactions(db, org_id)


@router.get("/cashflow")
def get_cashflow(
    org_id: UUID,
    db: Session = Depends(get_db),
    # Monthly cashflow trends for viewers and up
    membership = Depends(require_role("viewer"))
):

    return dashboard_service.cashflow_trend(db, org_id)


@router.get("/top-expenses")
def get_top_expenses(
    org_id: UUID,
    db: Session = Depends(get_db),
    # Top spending categories for insights
    membership = Depends(require_role("viewer"))
):

    return dashboard_service.top_expense_categories(db, org_id)


@router.get("/savings-rate")
def get_savings_rate(
    org_id: UUID,
    db: Session = Depends(get_db),
    # Calculate savings metrics
    membership = Depends(require_role("viewer"))
):

    return dashboard_service.savings_rate(db, org_id)


@router.get("/largest-transactions")
def get_largest_transactions(
    org_id: UUID,
    db: Session = Depends(get_db),
    # Top transaction amounts
    membership = Depends(require_role("viewer"))
):

    return dashboard_service.largest_transactions(db, org_id)


@router.get("/weekly-trends")
def get_weekly_trends(
    org_id: UUID,
    db: Session = Depends(get_db),
    # Weekly spending patterns
    membership = Depends(require_role("viewer"))
):

    return dashboard_service.weekly_spending_trend(db, org_id)

