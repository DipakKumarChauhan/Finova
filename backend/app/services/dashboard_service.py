"""
Dashboard Service

Contains business logic for computing financial analytics and metrics
used by the finance dashboard. All functions enforce tenant isolation
by filtering records by organization_id and excluding soft-deleted records.

Includes:
- Summary metrics (income, expense, net balance)
- Category-based expense breakdown
- Time-series trends (monthly, weekly)
- Cashflow analysis
- Savings rate calculation
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.models.record import FinancialRecord


def get_summary(db: Session, org_id):
    """
    Fetch dashboard summary metrics for an organization.

    Aggregates financial records to compute:
    - total income (sum of all income transactions)
    - total expenses (sum of all expense transactions)
    - net balance (income - expenses)

    Only active records (not soft-deleted) are included in calculations.
    Results are scoped to the provided organization.

    Args:
        db: SQLAlchemy database session
        org_id: UUID of the organization to fetch metrics for

    Returns:
        dict with keys: total_income, total_expense, net_balance
    """

    result = db.query(
        func.sum(
            case(
                (FinancialRecord.transaction_type == "income", FinancialRecord.amount),
                else_=0
            )
        ).label("total_income"),

        func.sum(
            case(
                (FinancialRecord.transaction_type == "expense", FinancialRecord.amount),
                else_=0
            )
        ).label("total_expense")

    ).filter(
        # Tenant isolation: only fetch this org's records
        FinancialRecord.organization_id == org_id,
        # Soft deletion: exclude logically deleted records
        FinancialRecord.deleted_at == None
    ).first()

    # Handle NULL values from empty result sets
    total_income = result.total_income or 0
    total_expense = result.total_expense or 0

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "net_balance": total_income - total_expense
    }

def category_breakdown(db: Session, org_id):
    """
    Compute total amount per expense category for an organization.

    Groups financial records by category_id and sums the amounts.
    Useful for understanding spending distribution across categories.

    Args:
        db: SQLAlchemy database session
        org_id: UUID of the organization

    Returns:
        list[dict] with keys: category_id, total_amount
    """

    results = db.query(
        FinancialRecord.category_id,
        func.sum(FinancialRecord.amount)
    ).filter(
        # Tenant isolation aur soft deletion check
        FinancialRecord.organization_id == org_id,
        FinancialRecord.deleted_at == None
    ).group_by(
        # GROUP BY category_id to aggregate amounts per category
        FinancialRecord.category_id
    ).all()

    # Convert SQLAlchemy rows to JSON-safe dictionaries
    return [
        {
            "category_id": category_id,
            "total_amount": float(total_amount or 0),
        }
        for category_id, total_amount in results
    ]

def monthly_trends(db: Session, org_id):
    """
    Fetch monthly income/expense trends for an organization.

    Groups transactions by month using DATE_TRUNC and sums amounts
    to show cashflow patterns over time.

    Args:
        db: SQLAlchemy database session
        org_id: UUID of the organization

    Returns:
        list[dict] with keys: month, total_amount (chronologically ordered)
    """

    # DATE_TRUNC('month', ...) groups dates by month boundary
    results = db.query(
        func.date_trunc("month", FinancialRecord.transaction_date).label("month"),
        func.sum(FinancialRecord.amount)
    ).filter(
        FinancialRecord.organization_id == org_id,
        FinancialRecord.deleted_at == None
    ).group_by("month").order_by("month").all()

    # Convert month timestamp to JSON-safe format
    return [
        {
            "month": month,
            "total_amount": float(total_amount or 0),
        }
        for month, total_amount in results
    ]

def recent_transactions(db: Session, org_id):
    """
    Fetch the 10 most recent transactions for an organization.

    Returns complete transaction details ordered by transaction_date DESC.
    Useful for dashboard widgets showing latest activity.

    Args:
        db: SQLAlchemy database session
        org_id: UUID of the organization

    Returns:
        list[dict] with transaction details (id, type, amount, date, etc.)
    """

    # Sort by transaction_date DESC to show latest first, limit to 10
    records = db.query(FinancialRecord).filter(
        FinancialRecord.organization_id == org_id,
        FinancialRecord.deleted_at == None
    ).order_by(
        FinancialRecord.transaction_date.desc()
    ).limit(10).all()

    return [
        {
            "id": record.id,
            "organization_id": record.organization_id,
            "created_by": record.created_by,
            "category_id": record.category_id,
            "amount": float(record.amount),
            "transaction_type": record.transaction_type,
            "transaction_date": record.transaction_date,
            "description": record.description,
            "created_at": record.created_at,
            "updated_at": record.updated_at,
        }
        for record in records
    ]


def cashflow_trend(db: Session, org_id):
    """
    Compute monthly cashflow trends (income, expense, net).

    Aggregates transactions by month using CASE statements to
    separate income from expense amounts. Returns income, expense,
    and net (income - expense) for each month.

    Args:
        db: SQLAlchemy database session
        org_id: UUID of the organization

    Returns:
        list[dict] with keys: month (YYYY-MM format), income, expense, net
    """

    # Using CASE to conditionally sum income vs expense amounts
    results = (
        db.query(
            func.date_trunc("month", FinancialRecord.transaction_date).label("month"),
            func.sum(
                case(
                    (FinancialRecord.transaction_type == "income", FinancialRecord.amount),
                    else_=0,
                )
            ).label("income"),
            func.sum(
                case(
                    (FinancialRecord.transaction_type == "expense", FinancialRecord.amount),
                    else_=0,
                )
            ).label("expense"),
        )
        .filter(
            FinancialRecord.organization_id == org_id,
            FinancialRecord.deleted_at == None,
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    return [
        {
            "month": month.strftime("%Y-%m") if month else None,
            "income": float(income or 0),
            "expense": float(expense or 0),
            "net": float((income or 0) - (expense or 0)),
        }
        for month, income, expense in results
    ]


def top_expense_categories(db: Session, org_id):
    """
    Fetch top 5 expense categories by total spending.

    Filters to expense transactions only, groups by category,
    sums amounts, and orders by highest spending first.
    Useful for identifying where most money is being spent.

    Args:
        db: SQLAlchemy database session
        org_id: UUID of the organization

    Returns:
        list[dict] with keys: category_id, total_expense (top 5 only)
    """

    results = (
        db.query(
            FinancialRecord.category_id,
            func.sum(FinancialRecord.amount).label("total_expense"),
        )
        .filter(
            FinancialRecord.organization_id == org_id,
            FinancialRecord.deleted_at == None,
            # Only expenses, yaha income ko exclude kar rahe hain
            FinancialRecord.transaction_type == "expense",
        )
        .group_by(FinancialRecord.category_id)
        # ORDER BY SUM(amount) DESC to get highest spenders first
        .order_by(func.sum(FinancialRecord.amount).desc())
        # Limit to top 5 to avoid overwhelming the UI
        .limit(5)
        .all()
    )

    return [
        {
            "category_id": category_id,
            "total_expense": float(total_expense or 0),
        }
        for category_id, total_expense in results
    ]


def savings_rate(db: Session, org_id):
    """
    Calculate savings rate for an organization.

    Computes savings_rate = (total_income - total_expense) / total_income
    Returns 0 if total_income is 0 to avoid division by zero.

    Args:
        db: SQLAlchemy database session
        org_id: UUID of the organization

    Returns:
        dict with keys: income, expense, savings_rate (0.0 to 1.0)
    """

    result = (
        db.query(
            func.sum(
                case(
                    (FinancialRecord.transaction_type == "income", FinancialRecord.amount),
                    else_=0,
                )
            ).label("income"),
            func.sum(
                case(
                    (FinancialRecord.transaction_type == "expense", FinancialRecord.amount),
                    else_=0,
                )
            ).label("expense"),
        )
        .filter(
            FinancialRecord.organization_id == org_id,
            FinancialRecord.deleted_at == None,
        )
        .first()
    )

    income = float(result.income or 0)
    expense = float(result.expense or 0)
    # Avoid division by zero: if no income, savings_rate = 0
    savings_rate_value = (income - expense) / income if income else 0

    return {
        "income": income,
        "expense": expense,
        "savings_rate": savings_rate_value,
    }


def largest_transactions(db: Session, org_id):
    """
    Fetch the 5 largest transactions by absolute amount.

    Returns both income and expense transactions, ordered by
    highest amount first. Useful for identifying key cash movements.

    Args:
        db: SQLAlchemy database session
        org_id: UUID of the organization

    Returns:
        list[dict] with keys: amount, transaction_type, transaction_date
    """

    records = (
        db.query(FinancialRecord)
        .filter(
            FinancialRecord.organization_id == org_id,
            FinancialRecord.deleted_at == None,
        )
        .order_by(FinancialRecord.amount.desc())
        .limit(5)
        .all()
    )

    return [
        {
            "amount": float(record.amount),
            "transaction_type": record.transaction_type,
            "transaction_date": record.transaction_date.date().isoformat()
            if record.transaction_date
            else None,
        }
        for record in records
    ]


def weekly_spending_trend(db: Session, org_id):
    """
    Compute weekly expense spending trends.

    Groups expense transactions by week using DATE_TRUNC and sums amounts
    to show spending patterns at weekly granularity.

    Args:
        db: SQLAlchemy database session
        org_id: UUID of the organization

    Returns:
        list[dict] with keys: week (ISO format), total (chronologically ordered)
    """

    # DATE_TRUNC('week', ...) groups to Monday of each week
    results = (
        db.query(
            func.date_trunc("week", FinancialRecord.transaction_date).label("week"),
            func.sum(FinancialRecord.amount).label("total"),
        )
        .filter(
            FinancialRecord.organization_id == org_id,
            FinancialRecord.deleted_at == None,
            # Expenses only for spending trend analysis
            FinancialRecord.transaction_type == "expense",
        )
        .group_by("week")
        # ORDER BY week chronologically
        .order_by("week")
        .all()
    )

    return [
        {
            "week": week.date().isoformat() if week else None,
            "total": float(total or 0),
        }
        for week, total in results
    ]

