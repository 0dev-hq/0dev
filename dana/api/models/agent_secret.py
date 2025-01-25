from sqlalchemy import Column, ForeignKey, String, TIMESTAMP, PrimaryKeyConstraint
from datetime import datetime, timezone
from api.db import Base


class AgentSecret(Base):
    __tablename__ = "agent_secrets"

    agent_id = Column(String, ForeignKey("agents.agent_id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    value = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (PrimaryKeyConstraint("name", "agent_id"),)
