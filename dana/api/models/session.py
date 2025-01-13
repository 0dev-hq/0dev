from api.db import db
from datetime import datetime
import uuid


class AgentSession(db.Model):
    __tablename__ = "agent_sessions"

    session_id = db.Column(
        db.String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    agent_id = db.Column(db.String(255), nullable=False)
    account_id = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
