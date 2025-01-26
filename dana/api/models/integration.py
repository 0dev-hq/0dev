from sqlalchemy import (
    Column,
    ForeignKey,
    String,
    TIMESTAMP,
    Enum,
    PrimaryKeyConstraint,
)
from datetime import datetime, timezone
from api.db import Base
import enum


class IntegrationType(enum.Enum):
    OAUTH = "oauth"
    CUSTOM = "custom"


class Integration(Base):
    __tablename__ = "integrations"

    agent_id = Column(
        String, ForeignKey("agents.agent_id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String, nullable=False)
    type = Column(Enum(IntegrationType), nullable=False)
    credentials = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (PrimaryKeyConstraint("name", "agent_id"),)
