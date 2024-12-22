from abc import ABC, abstractmethod


class BaseInteractor(ABC):

    @abstractmethod
    def interact(self, user_input: str, session_id: str, agent_url: str) -> dict:
        """
        Interact with the agent to process input and determine actions or perceptions.

        :param user_input: Input string from the user.
        :param session_id: The session ID for this interaction.
        :param agent_url: The URL of the agent to interact with.
        :return: A dictionary representing the agent's response or next step.
        """
        pass
