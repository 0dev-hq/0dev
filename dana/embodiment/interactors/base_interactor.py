from abc import ABC, abstractmethod


class BaseInteractor(ABC):

    @abstractmethod
    def interact(self, user_input: str, session_id: str, agent_deployment_metadata) -> dict:
        """
        Interact with the agent to process input and determine actions or perceptions.

        :param user_input: Input string from the user.
        :param session_id: The session ID for this interaction.
        :param agent_deployment_metadata: Metadata containing information about the deployed agent, such as its URL.
        :return: A dictionary representing the agent's response or next step.
        """
        pass
