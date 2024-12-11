from abc import ABC, abstractmethod


class BaseHistoryManager(ABC):
    """
    Abstract base class for managing interaction history.
    Defines the interface for saving interactions, retrieving history, and managing summaries.
    """

    @abstractmethod
    def save_interaction(self, account_id: str, agent_id: str, session_id: str, interaction: dict):
        """
        Save a new interaction to the history storage.

        :param account_id: The ID of the account the agent belongs to.
        :param agent_id: The id of the agent.
        :param session_id: The session ID this interaction belongs to.
        :param interaction: A dictionary representing the interaction details.
        """
        pass

    @abstractmethod
    def get_history(self, account_id: str, agent_id: str, n: int = 10) -> list:
        """
        Retrieve the last 'n' interactions for a given account and agent.

        :param account_id: The ID of the account to filter by.
        :param agent_id: The id of the agent to filter by.
        :param n: The number of recent interactions to return.
        :return: A list of interactions sorted by timestamp in descending order.
        """
        pass

    @abstractmethod
    def get_summary(self, account_id: str, agent_id: str, session_id: str) -> str:
        """
        Retrieve the summary for the given session.

        :param account_id: The ID of the account.
        :param agent_id: The id of the agent.
        :param session_id: The session ID to filter by.
        :return: A string summarizing the interactions for the session.
        """
        pass

    @abstractmethod
    def start_session(self) -> str:
        """
        Start a new interaction session and return its session ID.

        :return: The session ID.
        """
        pass

    @abstractmethod
    def update_summary(self, account_id: str, agent_id: str, session_id: str, new_interaction: str) -> str:
        """
        Incrementally update the summary for the session by including a new interaction.

        :param account_id: The ID of the account.
        :param agent_id: The id of the agent.
        :param session_id: The session ID.
        :param new_interaction: The new interaction text to incorporate into the summary.
        :return: The updated summary string.
        """
        pass
