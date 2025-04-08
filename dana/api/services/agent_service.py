from api.models.agent import Agent
from api.models.session import AgentSession
from api.db import db
from embodiment.interactors.interactor_factory import InteractorFactory


class AgentService:

    def __init__(self):
        self.interactor = InteractorFactory.create()

    def create_session(self, agent_id: str, account_id: str) -> str:
        """
        Create a new session and return the session ID.
        """
        session = AgentSession(agent_id=agent_id, account_id=account_id)
        db.session.add(session)
        db.session.commit()
        return session.session_id

    def get_sessions(self, agent_id: str, account_id: str) -> list:
        """
        Retrieve all sessions for a specific agent.
        """
        sessions = AgentSession.query.filter_by(
            agent_id=agent_id, account_id=account_id
        ).all()
        return [
            {"session_id": s.session_id, "created_at": s.created_at} for s in sessions
        ]

    def get_generated_codes(self, agent_id: str) -> dict:
        """
        Retrieve all generated codes for an agent.
        """
        # Placeholder logic - replace with DB fetch
        return [{"name": "example_code", "version": 1, "description": "Test code"}]

    def interact(
        self, account_id: str, agent_id: str, user_input: str, session_id: str = None
    ):
        """
        Engage with the agent to process input and determine actions or perceptions.
        :param account_id: Account ID associated with the agent.
        :param agent_id: Agent ID to interact with.
        :param user_input: Input string from the user.
        :param session_id: The session ID for this interaction.
        :return: A dictionary representing the agent's response.
        """

        # 1. Find the agent's url if it exists. If not, raise an error.

        agent = Agent.query.filter_by(agent_id=agent_id, account_id=account_id).first()
        if not agent:
            raise ValueError("Agent not found.")

        if not session_id:
            raise ValueError("Session ID is required.")

        # 2. Interact with the agent
        response = self.interactor.interact(
            user_input, session_id, agent.deployment_metadata
        )
        return response
