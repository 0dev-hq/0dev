from abc import ABC, abstractmethod
from collections import namedtuple
import uuid
import secrets
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os


CreateJobResult = namedtuple("CreateJobResult", ["job_id", "secret"])

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
        secret = secrets.token_urlsafe(32)
        with self.Session() as session:
            session.execute(
                text(
                    """
                    INSERT INTO jobs (account_id, agent_id, job_id, session_id, status, secret)
                    VALUES (:account_id, :agent_id, :job_id, :session_id, 'pending', :secret)
                """
                ),
                {
                    "account_id": account_id,
                    "agent_id": agent_id,
                    "job_id": job_id,
                    "session_id": session_id,
                    "secret": secret,
                },
            )
            session.commit()
        return CreateJobResult(job_id=job_id, secret=secret)

    def update_job_status(self, job_id, status, secret, result=None):
        with self.Session() as session:
            session.execute(
                text(
                    """
                    UPDATE jobs
                    SET status = :status, updated_at = NOW(), result = COALESCE(:result, result)
                    WHERE job_id = :job_id AND secret = :secret
                """
                ),
                {"status": status, "result": result, "job_id": job_id, "secret": secret},
            )
            session.commit()

    @abstractmethod
    def execute_job(self, job_id, secret, code, requirements, inputs):
        """
        Execute the job and update its status in the database.
        :param job_id: The job ID.
        :param secret: The secret key to authenticate the job.
        :param code: The code to execute.
        :param requirements: The requirements for the code.
        :param inputs: The inputs for the code.
        """
        pass
