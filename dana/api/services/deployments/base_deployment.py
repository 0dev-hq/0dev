from abc import ABC, abstractmethod


class BaseDeployment(ABC):
    """
    Abstract base class for agent deployment strategies.
    """

    @abstractmethod
    def package(self, agent_id: str, agent_details: dict) -> str:
        """
        Package the agent details into a configuration or directory.
        :param agent_id: Unique identifier for the agent.
        :param agent_details: Dictionary containing agent configurations.
        :return: Path or location of the packaged agent.
        """
        pass

    @abstractmethod
    def deploy(self, package_path: str) -> dict:
        """
        Deploy the packaged agent and return deployment metadata.
        :param package_path: Path to the packaged agent.
        :return: Dictionary containing deployment metadata (e.g., URL, ARN).
        """
        pass

    @abstractmethod
    def destroy(self, deployment_metadata: dict) -> None:
        """
        Destroy the deployed agent based on the deployment metadata.
        :param deployment_metadata: Dictionary containing deployment metadata.
        """
        pass
