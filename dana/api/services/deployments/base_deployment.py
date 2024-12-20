from abc import ABC, abstractmethod
from typing import Dict


class BaseDeployment(ABC):
    """
    Abstract base class for agent deployment strategies.
    """

    @abstractmethod
    def package(self, agent_id: str, agent_details: Dict) -> str:
        """
        Package the agent details into a configuration or directory.
        :param agent_id: Unique identifier for the agent.
        :param agent_details: Dictionary containing agent configurations.
        :return: Path or location of the packaged agent.
        """
        pass

    @abstractmethod
    def deploy(self, package_path: str) -> Dict:
        """
        Deploy the packaged agent and return deployment metadata.
        :param package_path: Path to the packaged agent.
        :return: Dictionary containing deployment metadata (e.g., URL, ARN).
        """
        pass
