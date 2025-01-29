from sqlalchemy import Column, UniqueConstraint, String, TIMESTAMP, Enum
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime, timezone
from api.db import Base
import enum


class AgentStatus(enum.Enum):
    RUNNING = "running"
    FAILED = "failed"
    PAUSED = "paused"
    DELETED = "deleted"


class Agent(Base):
    __tablename__ = "agents"

    agent_id = Column(String, primary_key=True, nullable=False)
    account_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    intents = Column(String, nullable=False)
    policies = Column(String, nullable=True)
    facts = Column(String, nullable=True)
    deployment_metadata = Column(JSONB, nullable=True)
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc))
    status = Column(Enum(AgentStatus), default=AgentStatus.RUNNING)
    categories = Column(String, nullable=True)

    __table_args__ = (
        UniqueConstraint("name", "account_id", name="unique_agent_name"),
    )
