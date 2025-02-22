from uuid import uuid4
from api.models.job import Job, JobType
from api.db import db
import json


class JobAlreadyCompleted(Exception):
    pass


class JobNotFound(Exception):
    pass


class JobService:

    def create_job(
        self,
        account_id: str,
        agent_id: str,
        session_id: str,
        name: str,
        description: str,
    ) -> Job:
        job_id = str(uuid4())
        job = Job(
            job_id=job_id,
            account_id=account_id,
            agent_id=agent_id,
            session_id=session_id,
            status=JobType.CREATED,
            name=name,
            description=description,
        )
        db.session.add(job)
        db.session.commit()
        return job

    def update_job_status(
        self, job_id: str, account_id: str, status: str, payload: dict = None
    ) -> Job:
        job = Job.query.filter_by(job_id=job_id, account_id=account_id).first()
        if job:
            if job.status == JobType.COMPLETED or job.status == JobType.FAILED:
                raise JobAlreadyCompleted("Job already completed")
            job.status = JobType[status.upper()]
            job.payload = json.dumps(payload) if payload else None
            db.session.commit()
            return job
        raise JobNotFound("Job not found")
