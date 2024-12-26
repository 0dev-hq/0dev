from flask import Blueprint, g, jsonify, request
from api.services.agent_service import AgentService

agents_bp = Blueprint("agents", __name__)
agent_service = AgentService()


@agents_bp.route("/<agent_id>/session", methods=["GET"])
def list_sessions(agent_id):
    """
    List all sessions for a specific agent.
    """

    account_id = g.get("account_id")
    sessions = agent_service.get_sessions(agent_id=agent_id, account_id=account_id)
    return jsonify(sessions), 200


@agents_bp.route("/<agent_id>/session/<session_id>/history", methods=["GET"])
def list_history(agent_id, session_id):
    """
    List the interaction history for a specific session.
    """
    history = agent_service.get_history(agent_id, session_id)
    return jsonify(history), 200


@agents_bp.route("/<agent_id>/generated-code", methods=["GET"])
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
    account_id = g.get("account_id")

    if not user_input:
        return jsonify({"error": "Input is required."}), 400

    try:
        response = agent_service.interact(
            account_id=account_id,
            agent_id=agent_id,
            user_input=user_input,
            session_id=session_id,
        )
        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": f"Failed to interact with agent: {str(e)}"}), 500
