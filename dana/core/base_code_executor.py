from abc import ABC, abstractmethod
from collections import namedtuple
import json
import uuid
import secrets
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

from core.perception_handler import InputItemFormat


CreateJobResult = namedtuple("CreateJobResult", ["job_id", "secret_token"])


class BaseCodeExecutor(ABC):
    def __init__(self):
        self.engine = self._create_db_engine()
        self.Session = sessionmaker(bind=self.engine)

    def _create_db_engine(self):
        db_user = os.getenv("INTERNAL_DB_USER")
        db_pass = os.getenv("INTERNAL_DB_PASS")
        db_host = os.getenv("INTERNAL_DB_HOST")
        db_port = os.getenv("INTERNAL_DB_PORT")
        db_name = os.getenv("INTERNAL_DB_NAME")
        return create_engine(
            f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
        )

    def create_job(self, account_id, agent_id, session_id) -> CreateJobResult:
        job_id = str(uuid.uuid4())
        secret_token = secrets.token_urlsafe(32)
        with self.Session() as session:
            session.execute(
                text(
                    """
                    INSERT INTO agent_jobs (account_id, agent_id, job_id, session_id, status, secret, created_at)
                    VALUES (:account_id, :agent_id, :job_id, :session_id, 'pending', :secret, NOW())
                """
                ),
                {
                    "account_id": account_id,
                    "agent_id": agent_id,
                    "job_id": job_id,
                    "session_id": session_id,
                    "secret": secret_token,
                },
            )
            session.commit()
        return CreateJobResult(job_id=job_id, secret_token=secret_token)

    def update_job_status(self, job_id, status, secret_token, result=None):

        serialized_result = json.dumps(result) if result else None
        with self.Session() as session:

            session.execute(
                text(
                    """
                    UPDATE agent_jobs
                    SET status = :status, updated_at = NOW(), result = COALESCE(:result, result)
                    WHERE job_id = :job_id AND secret = :secret
                """
                ),
                {
                    "status": status,
                    "result": serialized_result,
                    "job_id": job_id,
                    "secret": secret_token,
                },
            )
            session.commit()

    @abstractmethod
    def execute_job(
        self,
        job_id: str,
        secret_token: str,
        code: str,
        requirements: list,
        inputs: list[InputItemFormat],
        secrets: dict,
    ):
        """
        Execute the job and update its status in the database.
        :param job_id: The job ID.
        :param secret_token: The secret token to authenticate the job.
        :param code: The code to execute.
        :param requirements: The requirements for the code.
        :param inputs: The inputs for the code.
        :param secrets: The secrets required by the code.
        """
        pass
