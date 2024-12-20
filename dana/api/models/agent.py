from sqlalchemy import Column, PrimaryKeyConstraint, String, TIMESTAMP, Enum
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

    agent_id = Column(String, nullable=False)
    account_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    intents = Column(String, nullable=False)
    policies = Column(String, nullable=True)
    facts = Column(String, nullable=True)
    deployment_url = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc))
    status = Column(Enum(AgentStatus), default=AgentStatus.RUNNING)

    __table_args__ = (
        PrimaryKeyConstraint("agent_id", "account_id"),
    )
