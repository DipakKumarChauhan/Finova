"""
Role-Based Access Control (RBAC) Middleware

Provides permission checking at the route level to enforce role hierarchy.
Uses a dependency injector pattern with FastAPI's Depends() to validate
user roles against required minimums before allowing route access.

Role Hierarchy:
- viewer (1): can read dashboard and analytics only
- analyst (2): can view records and analytics
- admin (3): can manage records and users

All RBAC checks are scoped to organizations (multi-tenant isolation).
"""

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.roles import ROLE_HIERARCHY, ROLES, Role
from app.db.session import get_db
from app.middleware.auth_dependency import get_current_user
from app.services.membership_services import get_membership


def require_role(min_role: Role | str):
    """
    FastAPI dependency that enforces minimum role requirements.

    This is a higher-order function that returns a role_checker
    dependency. Use it with: Depends(require_role('admin'))

    Args:
        min_role: Role enum or string ('viewer', 'analyst', 'admin')

    Returns:
        role_checker function that validates user role

    Raises:
        ValueError: if min_role is not a valid role
    """

    # Normalize role to string value (handles both enum and string inputs)
    required_role = min_role.value if isinstance(min_role, Role) else min_role

    # Validate that the required role exists
    if required_role not in ROLES:
        raise ValueError(f"Invalid required role: {required_role}")

    def role_checker(
        org_id: UUID | None = None,
        organization_id: UUID | None = None,
        current_user=Depends(get_current_user),
        db: Session = Depends(get_db)
    ):
        """
        Validates user's role for the organization.

        Checks that:
        1. User is a member of the organization
        2. User's role >= required minimum role (by hierarchy)

        Arguments can use either org_id or organization_id for flexibility.

        Args:
            org_id: UUID of organization (alternate naming)
            organization_id: UUID of organization (standard naming)
            current_user: Authenticated user object from JWT token
            db: Database session

        Returns:
            membership object if authorized

        Raises:
            HTTPException 400: if organization_id is not provided
            HTTPException 403: if not a member or insufficient role
        """

        # Accept either org_id or organization_id for flexibility
        org_identifier = org_id or organization_id

        if not org_identifier:
            raise HTTPException(status_code=400, detail="organization_id is required")

        # Fetch user's membership in this organization
        membership = get_membership(db, current_user.id, org_identifier)

        # Handle both enum and string role formats
        member_role = membership.role.value if isinstance(membership.role, Role) else membership.role

        # Validate role value exists in hierarchy
        if member_role not in ROLE_HIERARCHY:
            raise HTTPException(status_code=403, detail="Invalid membership role")

        # Compare role hierarchy levels (higher number = more permissions)
        user_role_level = ROLE_HIERARCHY[member_role]
        required_role_level = ROLE_HIERARCHY[required_role]

        # RBAC enforcement: user must have role level >= required level
        # agar user analyst hai aur admin required hai, to deny kar do
        if user_role_level < required_role_level:
            raise HTTPException(status_code=403, detail="Insufficient permissions")

        return membership

    return role_checker