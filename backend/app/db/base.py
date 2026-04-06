from sqlalchemy.orm import declarative_base

Base = declarative_base()

from app.models import user
from app.models import organization
from app.models import membership
from app.models import category
from app.models import record
from app.models import refresh_token
from app.models import invite
from app.models import notification