import uuid
import json
from core.llms.base_llm import BaseLLM
import requests
from logging import getLogger

logger = getLogger(__name__)


class InteractionManager:
    """
    Service for managing interactions between agents and users.
    """

    def __init__(self, llm_client: BaseLLM, auth_token: str, dana_url: str):
        """
        :param llm_client: An LLM client instance for generating summaries.
        :param auth_token: The authentication token for the API.
        :param dana_url: The URL of the Dana API.
        """
        super().__init__()
        self.llm_client = llm_client
        self.auth_token = auth_token
        self.dana_url = dana_url

    @staticmethod
    def start_session() -> str:
        """
        Start a new interaction session and return its session ID.

        :return: The session ID.
        """
        return str(uuid.uuid4())

    def save_interaction(
        self, account_id: str, agent_id: str, session_id: str, interaction: dict
    ):
        """
        Save a new interaction and update the moving summary.

        :param account_id: The ID of the account the agent belongs to.
        :param agent_id: The id of the agent.
        :param session_id: The session ID this interaction belongs to.
        :param interaction: A dictionary representing the interaction details.
        """

        logger.info(f"Saving interaction: {interaction}")

        # todo: Use a singleton to keep the updated summary
        # 1. get the current summary
        response = requests.get(
            f"{self.dana_url}/interaction_history/session/{session_id}/summary",
            headers={"Authorization": f"Bearer {self.auth_token}"},
        )
        response.raise_for_status()
        current_summary = response.json()["summary"]

        # 2. generate a new summary
        updated_summary = self._update_summary(current_summary, interaction)

        # 3. save the new interaction history
        response = requests.post(
            f"{self.dana_url}/interaction_history/session/{session_id}/interaction",
            headers={"Authorization": f"Bearer {self.auth_token}"},
            json={
                "account_id": account_id,
                "agent_id": agent_id,
                "interaction": interaction,
                "summary": updated_summary,
            },
        )
        response.raise_for_status()

    def get_history(
        self, account_id: str, agent_id: str, session_id: str, n: int = 10
    ) -> list:
        """
        Retrieve the last 'n' interactions for a given session.

        :param account_id: The ID of the account to filter by.
        :param agent_id: The id of the agent to filter by.
        :param session_id: The session ID to filter by.
        :param n: The number of recent interactions to return.
        :return: A list of interactions sorted by timestamp in descending order.
        """
        response = requests.get(
            f"{self.dana_url}/interaction_history/session/{session_id}",
            headers={"Authorization": f"Bearer {self.auth_token}"},
        )
        response.raise_for_status()

        return [
            {"timestamp": row["timestamp"], "interaction": row["interaction"]}
            for row in response.json()["interactions"]
        ]

    def get_summary(self, account_id: str, agent_id: str, session_id: str) -> str:
        """
        Retrieve the latest moving summary for the session.

        :param account_id: The ID of the account.
        :param agent_id: The id of the agent.
        :param session_id: The session ID to filter by.
        :return: The latest summary as a string.
        """

        response = requests.get(
            f"{self.dana_url}/interaction_history/session/{session_id}/summary",
            headers={"Authorization": f"Bearer {self.auth_token}"},
        )
        response.raise_for_status()
        return response.json()["summary"]

        # return result[0] if result else "No summary available."

    def _update_summary(self, current_summary: str, new_interaction: dict) -> str:
        """
        Incrementally update the summary for the session by including a new interaction.

        :param current_summary: The current summary string.
        :param new_interaction: The new interaction text to incorporate into the summary.
        :return: The updated summary string.
        """
        try:
            prompt = [
                {
                    "role": "system",
                    "content": "You are a summarizer that creates very concise summaries of an agent's interactions.",
                },
                {
                    "role": "user",
                    "content": f"Current Summary: {current_summary}\nNew Interaction: {new_interaction}\nUpdate the summary to include the new interaction.",
                },
            ]
            response = self.llm_client.answer(prompt=prompt)
            return response.strip()
        except Exception as e:
            print(f"Error generating updated summary: {e}")
            return ""  # Return an empty summary if LLM fails
