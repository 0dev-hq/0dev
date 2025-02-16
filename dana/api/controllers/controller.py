import traceback
from flask import Blueprint, request, jsonify
from api.services.controller_service import ControllerService

controller_bp = Blueprint("controller", __name__)
_controller_service = ControllerService()


@controller_bp.route("/agent", methods=["POST"])
def create_agent():
    """
    Create a new agent.
    Input: JSON payload with agent details.
    """
    try:
        data = request.json
        # todo: validate input

        deployment_info = _controller_service.create_agent(data)
        return (
            jsonify(
                {
                    "agent_id": deployment_info["agent_id"],
                }
            ),
            201,
        )
    except Exception as e:
        print(f"stacktrace: {traceback.format_exc()}")
        return jsonify({"error": f"Failed to create agent: {str(e)}"}), 500


@controller_bp.route("/agent/<agent_id>", methods=["PUT"])
def update_agent(agent_id):
    """
    Update an agent's configuration.
    Input: JSON payload with updated fields.
    """
    data = request.json
    result = _controller_service.update_agent(agent_id, data)
    if result:
        return jsonify({"message": f"Agent '{agent_id}' updated successfully."}), 200
    return jsonify({"error": f"Agent '{agent_id}' not found."}), 404


@controller_bp.route("/agent", methods=["GET"])
def list_agents():
    """
    List all agents.
    """
    agents = _controller_service.list_agents()
    return jsonify(agents), 200


@controller_bp.route("/agent/<agent_id>", methods=["GET"])
def get_agent_details(agent_id):
    """
    Get details of a specific agent.
    """
    agent = _controller_service.get_agent(agent_id)
    print(f"agent: {agent}")
    if agent:
        return jsonify(agent), 200
    return jsonify({"error": f"Agent '{agent_id}' not found."}), 404


@controller_bp.route("/agent/<agent_id>", methods=["DELETE"])
def delete_agent(agent_id):
    """
    Delete an existing agent.
    """
    result = _controller_service.delete_agent(agent_id)
    if result:
        return jsonify({"message": f"Agent '{agent_id}' deleted successfully."}), 200
    return jsonify({"error": f"Agent '{agent_id}' not found."}), 404


@controller_bp.route("/agent/<agent_id>/pause", methods=["POST"])
def pause_agent(agent_id):
    """
    Pause an agent if supported.
    """
    result = _controller_service.pause_agent(agent_id)
    if result:
        return jsonify({"message": f"Agent '{agent_id}' paused successfully."}), 200
    return jsonify({"error": f"Failed to pause agent '{agent_id}'."}), 400


@controller_bp.route("/agent/<agent_id>/scale", methods=["POST"])
def scale_agent(agent_id):
    """
    Scale an agent.
    Input: JSON payload with 'scale_factor'.
    """
    scale_factor = request.json.get("scale_factor", 1)
    result = _controller_service.scale_agent(agent_id, scale_factor)
    if result:
        return (
            jsonify(
                {"message": f"Agent '{agent_id}' scaled to {scale_factor} instances."}
            ),
            200,
        )
    return jsonify({"error": f"Failed to scale agent '{agent_id}'."}), 400
