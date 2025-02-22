import json
import traceback

from flask import g
from sqlalchemy import func
from api.models.agent import Agent, AgentStatus
from api.models.agent_secret import AgentSecret
from api.models.integration import Integration
from api.models.session import AgentSession
from api.db import db
import uuid
from api.services.deployments.deployment_factory import DeploymentFactory
from cryptography.fernet import Fernet
import os
from logging import getLogger

from api.services.token_service import TokenService

logger = getLogger(__name__)


class ControllerService:
    """
    Service for managing agents.
    """

    def __init__(self):
        self.deployment_strategy = DeploymentFactory.create()
        encryption_key = os.getenv("SECRETS_ENCRYPTION_KEY")
        if not encryption_key:
            raise EnvironmentError("SECRETS_ENCRYPTION_KEY is not set.")
        self.fernet = Fernet(encryption_key.encode())

    def _encrypt_secret(self, value: str) -> str:
        """
        Encrypt a secret value.
        """
        return self.fernet.encrypt(value.encode()).decode()

    def _decrypt_secret(self, value: str) -> str:
        """
        Decrypt a secret value.
        """
        return self.fernet.decrypt(value.encode()).decode()

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
        Get details of a specific agent, including its secrets.
        """
        agent = (
            db.session.query(
                Agent.agent_id,
                Agent.name,
                Agent.description,
                Agent.intents,
                Agent.policies,
                Agent.facts,
                Agent.deployment_metadata,
                Agent.status,
                Agent.categories,
            )
            .filter(
                Agent.agent_id == agent_id,
                Agent.account_id == g.get("account_id"),
            )
            .first()
        )
        if agent:
            secrets = (
                db.session.query(AgentSecret)
                .filter(AgentSecret.agent_id == agent_id)
                .all()
            )

            secrets_list = [
                {
                    "name": secret.name,
                    "description": secret.description,
                    "value": self._decrypt_secret(secret.value),
                }
                for secret in secrets
            ]

            integrations = (
                db.session.query(Integration)
                .filter(Integration.agent_id == agent_id)
                .all()
            )

            integrations_list = [
                {
                    "name": integration.name,
                    "type": integration.type.value,
                    "credentials": json.loads(
                        self._decrypt_secret(integration.credentials)
                    ),
                }
                for integration in integrations
            ]

            return {
                "id": agent.agent_id,
                "name": agent.name,
                "description": agent.description,
                "intents": agent.intents.split(",") if agent.intents else [],
                "policies": agent.policies.split(",") if agent.policies else [],
                "facts": agent.facts.split(",") if agent.facts else [],
                "status": agent.status.value if agent.status else "",
                "categories": agent.categories.split(",") if agent.categories else [],
                "secrets": secrets_list,
                "integrations": integrations_list,
            }
        return None

    def update_agent(self, agent_id: str, updates: dict) -> bool:
        """
        Update an existing agent's configuration.
        """
        # 1. Find the agent based on the ID and account ID

        agent = (
            db.session.query(Agent)
            .filter(
                Agent.agent_id == agent_id and Agent.account_id == g.get("account_id")
            )
            .first()
        )

        if not agent:
            return False

        # 2. Update the agent's fields

        new_agent = {
            "name": updates.get("name", agent.name),
            "description": updates.get("description", agent.description),
            "intents": updates.get("intents", agent.intents),
            "policies": updates.get("policies", agent.policies),
            "facts": updates.get("facts", agent.facts),
            "categories": updates.get("categories", agent.categories),
        }

        # 3. Destroy the existing agent

        self.deployment_strategy.destroy(agent.deployment_metadata)

        # 4. Deploy the updated agent

        package_path = self.deployment_strategy.package(agent_id, new_agent)
        deployment_metadata = self.deployment_strategy.deploy(package_path)

        # 5. Update the agent in the database

        agent.name = new_agent["name"]
        agent.description = new_agent["description"]
        agent.intents = ",".join(new_agent["intents"])
        agent.policies = ",".join(new_agent["policies"])
        agent.facts = ",".join(new_agent["facts"])
        agent.categories = ",".join(new_agent["categories"])
        agent.deployment_metadata = deployment_metadata
        agent.status = AgentStatus.RUNNING

        # Update secrets
        if "secrets" in updates:
            db.session.query(AgentSecret).filter(
                AgentSecret.agent_id == agent_id
            ).delete()
            for secret in updates["secrets"]:
                new_secret = AgentSecret(
                    agent_id=agent_id,
                    name=secret["name"],
                    value=self._encrypt_secret(secret["value"]),
                    description=secret.get("description", ""),
                )
                db.session.add(new_secret)

        # Update integrations
        if "integrations" in updates:
            db.session.query(Integration).filter(
                Integration.agent_id == agent_id
            ).delete()
            for integration in updates["integrations"]:
                new_integration = Integration(
                    agent_id=agent_id,
                    name=integration["name"],
                    type=integration["credentials"]["type"].upper(),
                    credentials=self._encrypt_secret(
                        json.dumps(integration["credentials"])
                    ),
                )
                db.session.add(new_integration)

        db.session.commit()
        return True

    def create_agent(self, agent_details: dict) -> dict:
        """
        Create, package, deploy, and persist a new agent.
        :param agent_details: Dictionary containing agent configurations.
        :return: Metadata about the deployed agent.
        """

        try:
            # Step 1: Package the agent
            # only the required fields are passed to the deployment strategy. Passing unsupported fields BREAKS the agent

            agent_id = str(uuid.uuid4())
            auth_token = TokenService.generate_token(
                account_id=g.get("account_id"), agent_id=agent_id
            )
            agent_config = {
                "id": agent_id,
                "auth_token": auth_token,
                "account_id": g.get("account_id"),
                "name": agent_details["name"],
                "description": agent_details.get("description", ""),
                "intents": agent_details.get("intents", []),
                "policies": agent_details.get("policies", []),
                "facts": agent_details.get("facts", []),
                "secrets": agent_details.get("secrets", []),
                "integrations": agent_details.get("integrations", []),
            }
            package_path = self.deployment_strategy.package(agent_id, agent_config)

            # Step 2: Deploy the agent
            deployment_metadata = self.deployment_strategy.deploy(package_path)

            # Step 3: Save the agent and its other details to the database
            new_agent = Agent(
                agent_id=agent_id,
                account_id=g.get("account_id"),
                name=agent_details["name"],
                description=agent_details.get("description", ""),
                intents=",".join(agent_details.get("intents", [])),
                policies=",".join(agent_details.get("policies", [])),
                facts=",".join(agent_details.get("facts", [])),
                deployment_metadata=deployment_metadata,
                status=AgentStatus.RUNNING,
                categories=",".join(agent_details.get("categories", [])),
            )
            db.session.add(new_agent)

            # Add secrets to the agent
            for secret in agent_details.get("secrets", []):
                new_secret = AgentSecret(
                    agent_id=agent_id,
                    name=secret["name"],
                    value=self._encrypt_secret(secret["value"]),
                    description=secret.get("description", ""),
                )
                db.session.add(new_secret)

            # Add integrations to the agent
            for integration in agent_details.get("integrations", []):
                new_integration = Integration(
                    agent_id=agent_id,
                    name=integration["name"],
                    type=integration["credentials"]["type"].upper(),
                    credentials=self._encrypt_secret(
                        json.dumps(integration["credentials"])
                    ),
                )
                db.session.add(new_integration)

            db.session.commit()

            return {
                "agent_id": agent_id,
                "deployment": deployment_metadata,
            }
        except Exception as e:
            logger.error(traceback.format_exc())
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

        # 1. Find the agent based on the ID and account ID
        agent = (
            db.session.query(Agent)
            .filter(
                Agent.agent_id == agent_id and Agent.account_id == g.get("account_id")
            )
            .first()
        )

        if not agent:
            return False

        # 2. Destroy the agent
        self.deployment_strategy.destroy(agent.deployment_metadata)

        # 3. Delete the agent from the database

        # Delete associated secrets and integrations with cascade
        # db.session.query(AgentSecret).filter(AgentSecret.agent_id == agent_id).delete()
        db.session.delete(agent)
        db.session.commit()
        return True

    def pause_agent(self, agent_id: str) -> bool:
        """
        Pause the agent (stub for now).
        :param agent_id: ID of the agent.
        :return: True if paused successfully.
        """

        return False

    def scale_agent(self, agent_id: str, scale_factor: int) -> bool:
        """
        Scale the agent.
        :param agent_id: ID of the agent.
        :param scale_factor: Desired scale factor.
        :return: True if scaled successfully.
        """

        return False
