from api.models.session import AgentSession
from api.db import db


class AgentService:
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

    def get_history(self, agent_id: str, session_id: str) -> list:
        """
        Retrieve interaction history for a session.
        """
        # Placeholder logic - replace with DB fetch
        return [{"user_input": "example input", "response": "example response"}]

    def get_generated_codes(self, agent_id: str) -> list:
        """
        Retrieve all generated codes for an agent.
        """
        # Placeholder logic - replace with DB fetch
        return [{"name": "example_code", "version": 1, "description": "Test code"}]
