import logging
from flask import Flask, request, jsonify


class APIRunner:
    """
    Exposes an agent as a REST API using Flask.
    """

    def __init__(self, agent_class, agent_config):
        """
        Initialize the API Runner with the agent class and configuration.
        :param agent_class: The class of the agent to instantiate.
        :param agent_config: Configuration dictionary for initializing the agent.
        """
        self.agent = agent_class(**agent_config)
        self.app = Flask(__name__)
        self.logger = logging.getLogger(f"Agent-{agent_config['id']}")
        self._setup_logging(agent_config["id"])
        self._setup_routes()

    def _setup_logging(self, agent_id):
        """
        Configure logging for the API runner.
        :param agent_id: Unique identifier for the agent.
        """
        #  logger should wirte to file and console
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        self.logger.setLevel(logging.INFO)
        self.logger.addHandler(handler)
        self.app.logger = self.logger  # Redirect Flask logs to this logger

    def _setup_routes(self):
        """
        Define API routes for interacting with the agent.
        """

        @self.app.route("/interact", methods=["POST"])
        def interact():
            data = request.json
            user_input = data.get("input", "")
            session_id = data.get("session_id", "")
            if not user_input or not session_id:
                self.logger.error("Missing input or session_id in request.")
                return jsonify({"error": "Required field(s) missing."}), 400
            self.logger.info(f"Received input: {user_input}")

            response = self.agent.interact(user_input, session_id)
            return jsonify({"response": response})

        @self.app.route("/status", methods=["GET"])
        def status():
            return jsonify(
                {
                    "agentName": self.agent.name,
                    "type": self.agent.agent_type,
                    "status": "Running",
                }
            )

    def run(self, host="0.0.0.0", port=4002):
        """
        Start the API server.
        """
        self.logger.info(f"Starting API Runner for agent: {self.agent.name}")
        self.app.run(host=host, port=port, debug=False, use_reloader=False)
