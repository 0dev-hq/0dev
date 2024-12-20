from flask import Blueprint, jsonify, request
from api.services.agent_service import AgentService

agents_bp = Blueprint("agents", __name__)
agent_service = AgentService()


@agents_bp.route("/<agent_id>/sessions", methods=["GET"])
def list_sessions(agent_id):
    """
    List all sessions for a specific agent.
    """
    sessions = agent_service.get_sessions(agent_id)
    return jsonify(sessions), 200


@agents_bp.route("/<agent_id>/sessions/<session_id>/history", methods=["GET"])
def list_history(agent_id, session_id):
    """
    List the interaction history for a specific session.
    """
    history = agent_service.get_history(agent_id, session_id)
    return jsonify(history), 200


@agents_bp.route("/<agent_id>/generated-codes", methods=["GET"])
def list_generated_codes(agent_id):
    """
    List all generated codes for a specific agent.
    """
    codes = agent_service.get_generated_codes(agent_id)
    return jsonify(codes), 200


@agents_bp.route("/<agent_id>/interact", methods=["POST"])
def interact_agent(agent_id):
    """
    Interact with the specified agent. Starts a session if it's a new interaction.
    """
    user_input = request.json.get("input")
    session_id = request.json.get("session_id")
    account_id = request.json.get(
        "account_id"
    )  # todo: get this from the authentication token

    if not user_input or not account_id:
        return jsonify({"error": "Input and account_id are required."}), 400

    if not session_id:
        session_id = agent_service.create_session(agent_id, account_id)

    response = agent_service.save_interaction(
        session_id, user_input, {"message": "response placeholder"}
    )
    return jsonify({"session_id": session_id, "response": response})
