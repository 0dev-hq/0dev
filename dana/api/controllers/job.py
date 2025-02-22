import traceback
from flask import Blueprint, g
from flask import request, jsonify
from api.models.job import JobType
from api.services.job_service import JobAlreadyCompleted, JobNotFound, JobService
from api.socket_client import socket_client
import logging

logger = logging.getLogger(__name__)

job_bp = Blueprint("job", __name__)


_job_service = JobService()


@job_bp.route("/", methods=["POST"])
def create_job():
    """
    Create a new job.
    Input: JSON payload with account_id, agent_id, and session_id.
    """
    data = request.json
    account_id = g.get("account_id")
    agent_id = g.get("agent_id")
    session_id = data.get("session_id")
    name = data.get("name")
    description = data.get("description")

    logger.debug(f"Creating job for session {session_id}")

    try:
        job = _job_service.create_job(
            account_id=account_id,
            agent_id=agent_id,
            session_id=session_id,
            name=name,
            description=description,
        )
    except Exception as e:
        logger.error(f"Failed to create job: {str(e)}")
        return jsonify({"error": "Failed to create job."}), 500

    payload = {
        "job_id": job.job_id,
        "session_id": job.session_id,
        "agent_id": job.agent_id,
        "account_id": job.account_id,
        "status": job.status.value,
        "name": job.name,
        "description": job.description,
    }

    socket_client.emit_event(
        "job_created",
        payload,
    )

    return (
        jsonify(
            {
                "job_id": job.job_id,
            }
        ),
        201,
    )


@job_bp.route("/update_status", methods=["POST"])
def update_status():
    """
    Update the status of a job.
    Input: JSON payload with job_id, status, secret_token, and result.
    """
    account_id = g.get("account_id")
    data = request.json
    job_id = data.get("job_id")
    status = data.get("status")
    payload = data.get("payload")

    logger.debug(f"Received status update for job {job_id}: {status}")

    if status not in [
        JobType.COMPLETED.value,
        JobType.IN_PROGRESS.value,
        JobType.FAILED.value,
    ]:
        logger.debug(f"Invalid status: {status}")
        return jsonify({"error": "Invalid status."}), 400

    try:
        job = _job_service.update_job_status(
            job_id=job_id, account_id=account_id, status=status, payload=payload
        )
    except JobAlreadyCompleted:
        return jsonify({"error": "Job already completed."}), 400
    except JobNotFound:
        return jsonify({"error": "Job not found."}), 404
    except Exception as e:
        logger.error(f"Failed to update job status: {traceback.format_exc()}")
        return jsonify({"error": "Failed to update job status."}), 500

    if status == JobType.COMPLETED.value:
        event = "job_completed"
    elif status == JobType.IN_PROGRESS.value:
        event = "job_in_progress"
    else:
        event = "job_failed"

    payload = {
        "job_id": job.job_id,
        "session_id": job.session_id,
        "agent_id": job.agent_id,
        "account_id": job.account_id,
        "name": job.name,
        "description": job.description,
        "status": job.status.value,
        "result": job.payload,
    }

    socket_client.emit_event(
        event,
        payload,
    )
    return jsonify({"message": "Status update sent."}), 200
