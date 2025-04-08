from flask import Blueprint, jsonify, g, request
from api.services.interaction_history_service import InteractionHistoryService
from api.socket_client import socket_client

from logging import getLogger
import traceback
logger = getLogger(__name__)

interaction_history_bp = Blueprint("interaction_history", __name__)
_interaction_history_service = InteractionHistoryService()


@interaction_history_bp.route("/session/<session_id>", methods=["GET"])
def get_interaction_history(session_id):
    """
    Get the interaction history for a specific session.
    """

    account_id = g.get("account_id")
    agent_id = g.get("agent_id")
    history = _interaction_history_service.get_history(
        account_id=account_id,
        agent_id=agent_id,
        session_id=session_id,
    )
    return jsonify({"interactions": history}), 200


@interaction_history_bp.route("/session/<session_id>/summary", methods=["GET"])
def get_interaction_summary(session_id):
    """
    Get the summary for a specific session.
    """

    account_id = g.get("account_id")
    agent_id = g.get("agent_id")

    try:
        summary = _interaction_history_service.get_summary(
            account_id=account_id,
            agent_id=agent_id,
            session_id=session_id,
        )
        return jsonify({"summary": summary}), 200
    except Exception as e:
        logger.error(f"Error getting interaction summary: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@interaction_history_bp.route("/session/<session_id>/interaction", methods=["POST"])
def update_interaction(session_id):
    """
    Update the interaction for a specific session.
    """

    logger.info(f"Request body to save interaction: {request.json}")

    account_id = g.get("account_id")
    agent_id = g.get("agent_id")
    interaction = request.json.get("interaction")
    summary = request.json.get("summary")
    _interaction_history_service.save_interaction(
        account_id=account_id,
        agent_id=agent_id,
        session_id=session_id,
        interaction=interaction,
        summary=summary,
    )

    payload = {
        "account_id": account_id,
        "agent_id": agent_id,
        "session_id": session_id,
        "interaction": interaction,
    }
    logger.info(f"Payload: {payload}")

    if interaction.get("type") != "user_input":
        socket_client.emit_event("new_interaction", payload)

    return jsonify(interaction), 200
