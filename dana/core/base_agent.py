from abc import ABC, abstractmethod


class BaseAgent(ABC):
    """
    Abstract base class for all agents.
    Provides foundational attributes and enforces implementation of key methods.
    """

    def __init__(self, id: str, name: str, description: str, agent_type: str):
        """
        Initialize the agent with basic attributes.
        :param id: Unique ID of the agent.
        :param name: Unique name of the agent.
        :param description: Description of the agent.
        :param agent_type: Type of the agent (e.g., Reactive, Interactive).
        """
        self.id = id
        self.name = name
        self.description = description
        self.agent_type = agent_type
        self.action_history = []

    # @abstractmethod
    # def get_identity(self) -> str:
    #     """
    #     Return the identity of the agent.
    #     """
    #     pass

    # @abstractmethod
    # def log_action(self, action: str):
    #     """
    #     Log the action performed by the agent.
    #     :param action: Description of the action.
    #     """
    #     pass

    # @abstractmethod
    # def get_action_history(self) -> list:
    #     """
    #     Return the history of actions performed by the agent.
    #     """
    #     pass
