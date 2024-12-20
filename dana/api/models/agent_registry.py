class AgentRegistry:
    """
    Simulates a registry of agents and their configurations.
    """

    def __init__(self):
        self.agents = {
            "agent1": {"id": "agent1", "name": "Support Agent", "runner_type": "api", "status": "active"},
            "agent2": {"id": "agent2", "name": "Sales Agent", "runner_type": "lambda", "status": "active"},
        }

    def list_agents(self):
        """
        List all agents.
        """
        return [{"id": a["id"], "name": a["name"], "status": a["status"]} for a in self.agents.values()]

    def get_agent(self, agent_id):
        """
        Retrieve agent configuration.
        """
        return self.agents.get(agent_id)

    def add_agent(self, agent_data: dict) -> str:
        """
        Add a new agent.
        """
        agent_id = agent_data.get("id")
        self.agents[agent_id] = agent_data
        return agent_id

    def remove_agent(self, agent_id: str) -> bool:
        """
        Remove an agent by ID.
        """
        if agent_id in self.agents:
            del self.agents[agent_id]
            return True
        return False
