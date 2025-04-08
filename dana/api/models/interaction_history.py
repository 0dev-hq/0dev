from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey
from api.db import Base
from datetime import datetime, timezone

class InteractionHistory(Base):
    __tablename__ = "agent_interaction_history"

    id = Column(Integer, primary_key=True)
    account_id = Column(String, nullable=False)
    agent_id = Column(
        String,
        ForeignKey("agents.agent_id", ondelete="CASCADE"),
        nullable=False
    )
    session_id = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc))
    interaction = Column(JSON, nullable=False)
    summary = Column(String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "account_id": self.account_id,
            "agent_id": self.agent_id,
            "session_id": self.session_id,
            "timestamp": self.timestamp,
            "interaction": self.interaction,
            "summary": self.summary,
        }
