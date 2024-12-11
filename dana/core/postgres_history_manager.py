import os
import uuid
from datetime import datetime
from sqlalchemy import create_engine, text, Column, Integer, String, DateTime, JSON, Table, MetaData
from sqlalchemy.orm import sessionmaker
from core.base_history_manager import BaseHistoryManager
import json


class PostgresHistoryManager(BaseHistoryManager):
    """
    A PostgreSQL-based implementation for managing interaction history with a moving summary.
    """

    def __init__(self, llm_client):
        """
        Initialize the PostgreSQL History Manager with database connection and session maker.
        :param llm_client: An LLM client instance for generating summaries.
        """
        super().__init__()
        self.engine = self._create_db_engine()
        self.Session = sessionmaker(bind=self.engine)
        self.llm_client = llm_client

    def _create_db_engine(self):
        """Create a PostgreSQL engine using environment variables."""
        db_user = os.getenv("INTERNAL_DB_USER")
        db_pass = os.getenv("INTERNAL_DB_PASS")
        db_host = os.getenv("INTERNAL_DB_HOST")
        db_port = os.getenv("INTERNAL_DB_PORT")
        db_name = os.getenv("INTERNAL_DB_NAME")
        return create_engine(f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}")

    def initialize_table(self):
        """Create the interaction_history table if it does not exist."""
        metadata = MetaData()
        interaction_table = Table(
            "interaction_history",
            metadata,
            Column("id", Integer, primary_key=True),
            Column("account_id", String, nullable=False),
            Column("agent_id", String, nullable=False),
            Column("session_id", String, nullable=False),
            Column("timestamp", DateTime, default=datetime.utcnow),
            Column("interaction", JSON, nullable=False),
            Column("summary", String, nullable=True),  # Add summary column
        )
        metadata.create_all(self.engine)

    def start_session(self) -> str:
        """
        Start a new interaction session and return its session ID.

        :return: The session ID.
        """
        return str(uuid.uuid4())

    def save_interaction(self, account_id: str, agent_id: str, session_id: str, interaction: dict):
        """
        Save a new interaction and update the moving summary.
        
        :param account_id: The ID of the account the agent belongs to.
        :param agent_id: The id of the agent.
        :param session_id: The session ID this interaction belongs to.
        :param interaction: A dictionary representing the interaction details.
        """
        with self.Session() as session:
            # Fetch the current summary for the session
            result = session.execute(
                text("""
                    SELECT summary
                    FROM interaction_history
                    WHERE account_id = :account_id AND agent_id = :agent_id AND session_id = :session_id
                    ORDER BY timestamp DESC
                    LIMIT 1
                """),
                {"account_id": account_id, "agent_id": agent_id, "session_id": session_id}
            ).fetchone()

            current_summary = result[0] if result else ""

            # Generate a new summary incrementally
            updated_summary = self.update_summary(current_summary, interaction)

            # Save the new interaction with the updated summary
            session.execute(
                text("""
                    INSERT INTO interaction_history (account_id, agent_id, session_id, timestamp, interaction, summary)
                    VALUES (:account_id, :agent_id, :session_id, :timestamp, :interaction, :summary)
                """),
                {
                    "account_id": account_id,
                    "agent_id": agent_id,
                    "session_id": session_id,
                    "timestamp": datetime.utcnow(),
                    "interaction": json.dumps(interaction),
                    "summary": updated_summary
                }
            )
            session.commit()

    def get_history(self, account_id: str, agent_id: str, n: int = 10) -> list:
        """
        Retrieve the last 'n' interactions for a given account and agent.
        
        :param account_id: The ID of the account to filter by.
        :param agent_id: The id of the agent to filter by.
        :param n: The number of recent interactions to return.
        :return: A list of interactions sorted by timestamp in descending order.
        """
        with self.Session() as session:
            result = session.execute(
                text("""
                    SELECT timestamp, interaction
                    FROM interaction_history
                    WHERE account_id = :account_id AND agent_id = :agent_id
                    ORDER BY timestamp DESC
                    LIMIT :n
                """),
                {"account_id": account_id, "agent_id": agent_id, "n": n}
            ).fetchall()
            return [{"timestamp": row[0], "interaction": row[1]} for row in result]

    def get_summary(self, account_id: str, agent_id: str, session_id: str) -> str:
        """
        Retrieve the latest moving summary for the session.

        :param account_id: The ID of the account.
        :param agent_id: The id of the agent.
        :param session_id: The session ID to filter by.
        :return: The latest summary as a string.
        """
        with self.Session() as session:
            result = session.execute(
                text("""
                    SELECT summary
                    FROM interaction_history
                    WHERE account_id = :account_id AND agent_id = :agent_id AND session_id = :session_id
                    ORDER BY timestamp DESC
                    LIMIT 1
                """),
                {"account_id": account_id, "agent_id": agent_id, "session_id": session_id}
            ).fetchone()
            return result[0] if result else "No summary available."

    def update_summary(self, current_summary: str, new_interaction: dict) -> str:
        """
        Incrementally update the summary for the session by including a new interaction.

        :param current_summary: The current summary string.
        :param new_interaction: The new interaction text to incorporate into the summary.
        :return: The updated summary string.
        """
        try:
            prompt = [
                {"role": "system", "content": "You are a summarizer that creates very concise summaries of an agent's interactions."},
                {"role": "user", "content": f"Current Summary: {current_summary}\nNew Interaction: {new_interaction}\nUpdate the summary to include the new interaction."}
            ]
            response = self.llm_client.answer(prompt=prompt, format="text")
            return response.strip()
        except Exception as e:
            print(f"Error generating updated summary: {e}")
            return ""  # Return an empty summary if LLM fails
