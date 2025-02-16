from abc import ABC
from collections import namedtuple
import requests
from logging import getLogger

logger = getLogger(__name__)


CreateJobResult = namedtuple("CreateJobResult", ["job_id", "secret_token"])


class JobManager(ABC):
    def __init__(self, auth_token: str, dana_url: str):
        self.auth_token = auth_token
        self.dana_url = dana_url

    def create_job(self, session_id: str, name: str, description: str) -> str:
        
        payload = {
            "session_id": session_id,
            "name": name,
            "description": description,
        }
        logger.info(f"Creating job with payload: {payload}")
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json",
        }
        logger.info(f"auth_token: {self.auth_token}")
        response = requests.post(f"{self.dana_url}/job", json=payload, headers=headers)
        response.raise_for_status()
        job_id = response.json()["job_id"]
        return job_id

    def update_job_status(
        self,
        job_id: str,
        session_id: str,
        status: str,
        payload: dict = None,
    ):
        payload = {
            "job_id": job_id,
            "status": status,
            "payload": payload,
            "session_id": session_id,
        }
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json",
        }
        response = requests.post(
            f"{self.dana_url}/job/update_status", json=payload, headers=headers
        )
        response.raise_for_status()
