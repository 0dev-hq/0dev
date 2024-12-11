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
        self._setup_routes()

    def _setup_routes(self):
        """
        Define API routes for interacting with the agent.
        """
        @self.app.route('/interact', methods=['POST'])
        def interact():
            data = request.json
            user_input = data.get("input", "")
            session_id = data.get("session_id", "")
            if not user_input or not session_id:
                return jsonify({"error": "Required field(s) missing."}), 400
            
            response = self.agent.interact(user_input, session_id)
            return jsonify({"response": response})

        @self.app.route('/status', methods=['GET'])
        def status():
            return jsonify({"agentName": self.agent.name, "type": self.agent.agent_type, "status": "Running"})

    def run(self, host="0.0.0.0", port=5000):
        """
        Start the API server.
        """
        print(f"Starting API Runner for agent: {self.agent.name}")
        self.app.run(host=host, port=port)
