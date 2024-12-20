import traceback
from flask import Blueprint, request, jsonify
from api.services.controller_service import ControllerService

controller_bp = Blueprint("controller", __name__)
controller_service = ControllerService()


@controller_bp.route("/agents", methods=["POST"])
def create_agent():
    """
    Create a new agent.
    Input: JSON payload with agent details.
    """
    try:
        data = request.json
        if not data or "name" not in data:
            return jsonify({"error": "Agent name and details are required."}), 400

        deployment_info = controller_service.create_agent(data)
        return (
            jsonify(
                {
                    "message": f"Agent '{deployment_info['agent_id']}' created successfully.",
                    "deployment": deployment_info["deployment"],
                }
            ),
            201,
        )
    except Exception as e:
        print(f"stacktrace: {traceback.format_exc()}")
        return jsonify({"error": f"Failed to create agent: {str(e)}"}), 500


@controller_bp.route("/agents/<agent_id>", methods=["PUT"])
def update_agent(agent_id):
    """
    Update an agent's configuration.
    Input: JSON payload with updated fields.
    """
    data = request.json
    result = controller_service.update_agent(agent_id, data)
    if result:
        return jsonify({"message": f"Agent '{agent_id}' updated successfully."}), 200
    return jsonify({"error": f"Agent '{agent_id}' not found."}), 404


@controller_bp.route("/agents", methods=["GET"])
def list_agents():
    """
    List all agents.
    """
    agents = controller_service.list_agents()
    return jsonify(agents), 200


@controller_bp.route("/agents/<agent_id>", methods=["GET"])
def get_agent_details(agent_id):
    """
    Get details of a specific agent.
    """
    agent = controller_service.get_agent(agent_id)
    if agent:
        return jsonify(agent), 200
    return jsonify({"error": f"Agent '{agent_id}' not found."}), 404


@controller_bp.route("/agents/<agent_id>", methods=["DELETE"])
def delete_agent(agent_id):
    """
    Delete an existing agent.
    """
    result = controller_service.delete_agent(agent_id)
    if result:
        return jsonify({"message": f"Agent '{agent_id}' deleted successfully."}), 200
    return jsonify({"error": f"Agent '{agent_id}' not found."}), 404


@controller_bp.route("/agents/<agent_id>/pause", methods=["POST"])
def pause_agent(agent_id):
    """
    Pause an agent if supported.
    """
    result = controller_service.pause_agent(agent_id)
    if result:
        return jsonify({"message": f"Agent '{agent_id}' paused successfully."}), 200
    return jsonify({"error": f"Failed to pause agent '{agent_id}'."}), 400


@controller_bp.route("/agents/<agent_id>/scale", methods=["POST"])
def scale_agent(agent_id):
    """
    Scale an agent.
    Input: JSON payload with 'scale_factor'.
    """
    scale_factor = request.json.get("scale_factor", 1)
    result = controller_service.scale_agent(agent_id, scale_factor)
    if result:
        return (
            jsonify(
                {"message": f"Agent '{agent_id}' scaled to {scale_factor} instances."}
            ),
            200,
        )
    return jsonify({"error": f"Failed to scale agent '{agent_id}'."}), 400
