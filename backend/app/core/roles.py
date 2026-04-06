from enum import Enum


class Role(str, Enum):
    viewer = "viewer"
    analyst = "analyst"
    admin = "admin"


ROLES = {role.value for role in Role}


ROLE_HIERARCHY = {
    Role.viewer.value: 1,
    Role.analyst.value: 2,
    Role.admin.value: 3,
}