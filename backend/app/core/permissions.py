from typing import List
from app.core.constants import UserRole
from app.core.exceptions import ForbiddenException


def require_roles(user_roles: List[str], allowed_roles: List[UserRole]) -> None:
    """Validate that the user possesses at least one of the allowed roles."""
    allowed_role_values = {role.value for role in allowed_roles}
    if not any(role in allowed_role_values for role in user_roles):
        raise ForbiddenException("Ushbu amalni bajarish uchun ruxsat berilmagan")

