from datetime import datetime, timezone
from sqlalchemy import Column, UniqueConstraint, String, TIMESTAMP, Enum, ForeignKey
from api.db import Base
import enum


class JobType(enum.Enum):
    CREATED = "created"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class Job(Base):
    __tablename__ = "agent_jobs"

    job_id = Column(String, primary_key=True, nullable=False)
    session_id = Column(String, nullable=False)
    agent_id = Column(
        String, ForeignKey("agents.agent_id", ondelete="CASCADE"), nullable=False
    )
    account_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(Enum(JobType), default=JobType.CREATED)
    payload = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("job_id", name="unique_job_id"),)
