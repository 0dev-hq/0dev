import traceback

from flask import g
from sqlalchemy import func
from api.models.agent import Agent, AgentStatus
from api.models.session import AgentSession
from api.db import db
import uuid
from api.services.deployments.deployment_factory import DeploymentFactory
from api.models.agent_registry import AgentRegistry  # todo: get rid of this import


class ControllerService:
    """
    Service for managing agents.
    """

    def __init__(self):
        self.deployment_strategy = DeploymentFactory.create()
        self.registry = AgentRegistry()

    def list_agents(self):
        """
        List all agents.
        """
        agents = (
            db.session.query(
                Agent.agent_id,
                Agent.name,
                Agent.description,
                Agent.categories,
                func.count(AgentSession.session_id).label("total_sessions"),
            )
            .outerjoin(AgentSession, Agent.agent_id == AgentSession.agent_id)
            .filter(Agent.account_id == g.get("account_id"))
            .group_by(Agent.agent_id, Agent.name, Agent.description, Agent.categories)
            .all()
        )
        return [
            {
                "id": agent.agent_id,
                "name": agent.name,
                "description": agent.description,
                "categories": agent.categories.split(",") if agent.categories else [],
                "totalSessions": agent.total_sessions,
            }
            for agent in agents
        ]

    def get_agent(self, agent_id: str) -> dict:
        """
        Get details of a specific agent.
        """
        agent = (
            db.session.query(
                Agent.agent_id,
                Agent.name,
                Agent.description,
                Agent.intents,
                Agent.policies,
                Agent.facts,
                Agent.deployment_url,
                Agent.status,
                Agent.categories,
            )
            .filter(
                Agent.agent_id == agent_id and Agent.account_id == g.get("account_id")
            )
            .first()
        )
        if agent:
            return {
                "id": agent.agent_id,
                "name": agent.name,
                "description": agent.description,
                "intents": agent.intents.split(",") if agent.intents else [],
                "policies": agent.policies.split(",") if agent.policies else [],
                "facts": agent.facts.split(",") if agent.facts else [],
                "status": agent.status.value if agent.status else "",
                "categories": agent.categories.split(",") if agent.categories else [],
            }
        return None

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
            # only the required fields are passed to the deployment strategy. Passing unsupported fields BREAKS the agent
            agent_config = {
                "id": agent_id,
                "account_id": g.get("account_id"),
                "name": agent_details["name"],
                "description": agent_details.get("description", ""),
                "intents": agent_details.get("intents", []),
                "policies": agent_details.get("policies", []),
                "facts": agent_details.get("facts", []),
            }
            package_path = self.deployment_strategy.package(agent_id, agent_config)

            # Step 2: Deploy the agent
            deployment_metadata = self.deployment_strategy.deploy(package_path)

            # Step 3: Save agent to the database
            new_agent = Agent(
                agent_id=agent_id,
                account_id=g.get("account_id"),
                name=agent_details["name"],
                description=agent_details.get("description", ""),
                intents=",".join(agent_details.get("intents", [])),
                policies=",".join(agent_details.get("policies", [])),
                facts=",".join(agent_details.get("facts", [])),
                deployment_url=deployment_metadata["url"],
                status=AgentStatus.RUNNING,
                categories=",".join(agent_details.get("categories", [])),
            )
            db.session.add(new_agent)
            db.session.commit()

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
