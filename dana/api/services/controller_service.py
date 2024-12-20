import traceback

from flask import g
from api.models.agent import Agent, AgentStatus
from api.db import db
import uuid
from api.services.deployments.deployment_factory import DeploymentFactory
from api.models.agent_registry import AgentRegistry  # todo: get rid of this import


class ControllerService:
    """
    Service for managing agents.
    """

    def __init__(self):
        self.deployment_strategy = DeploymentFactory.get_strategy()
        self.registry = AgentRegistry()

    def list_agents(self):
        """
        List all agents.
        """
        agents = Agent.query.all()
        return [
            {
                "agent_id": agent.agent_id,
                "name": agent.name,
                "status": agent.status.value,
                "deployment_url": agent.deployment_url,
                "created_at": agent.created_at.isoformat(),
            }
            for agent in agents
        ]

    def get_agent(self, agent_id: str):
        """
        Get details of a specific agent.
        """
        return self.registry.get_agent(agent_id)

    def update_agent(self, agent_id: str, updates: dict) -> bool:
        """
        Update an existing agent's configuration.
        """
        agent = self.registry.get_agent(agent_id)
        if agent:
            agent.update(updates)
            return True
        return False

    def create_agent(self, agent_details: dict) -> dict:
        """
        Create, package, deploy, and persist a new agent.
        :param agent_details: Dictionary containing agent configurations.
        :return: Metadata about the deployed agent.
        """

        try:
            # Generate a unique ID for the agent
            agent_id = str(uuid.uuid4())

            # Step 1: Package the agent
            package_path = self.deployment_strategy.package(agent_id, agent_details)

            # Step 2: Deploy the agent
            deployment_metadata = self.deployment_strategy.deploy(package_path)

            # Step 3: Save agent to the database
            new_agent = Agent(
                agent_id=agent_id,
                account_id=g.get("account_id"),
                name=agent_details["name"],
                intents=",".join(agent_details.get("intents", [])),
                policies=",".join(agent_details.get("policies", [])),
                facts=",".join(agent_details.get("facts", [])),
                deployment_url=deployment_metadata["url"],
                status=AgentStatus.RUNNING,
            )
            db.session.add(new_agent)
            # debug the db connection details
            print(f"DB connection details: {db.engine.url}")

            # db.session.commit()

            return {
                "agent_id": agent_id,
                "deployment": deployment_metadata,
            }
        except Exception as e:
            print(f"Error creating agent: {e}")
            print(f"stack trace: {traceback.format_exc()}")
            db.session.rollback()
            raise e
        finally:
            db.session.close()

    def delete_agent(self, agent_id: str) -> bool:
        """
        Delete an agent by its ID.
        :param agent_id: ID of the agent.
        :return: True if successful, False otherwise.
        """
        return self.registry.remove_agent(agent_id)

    def pause_agent(self, agent_id: str) -> bool:
        """
        Pause the agent (stub for now).
        :param agent_id: ID of the agent.
        :return: True if paused successfully.
        """
        agent = self.registry.get_agent(agent_id)
        if agent and "status" in agent:
            agent["status"] = "paused"
            return True
        return False

    def scale_agent(self, agent_id: str, scale_factor: int) -> bool:
        """
        Scale the agent.
        :param agent_id: ID of the agent.
        :param scale_factor: Desired scale factor.
        :return: True if scaled successfully.
        """
        agent = self.registry.get_agent(agent_id)
        if agent:
            agent["scale"] = scale_factor
            return True
        return False
