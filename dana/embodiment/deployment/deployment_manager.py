from abc import ABC, abstractmethod

class DeploymentManager(ABC):
    """
    Abstract base class for managing agent deployment.
    Handles packaging, building, and deploying agents to a target runtime.
    """

    @abstractmethod
    def package(self, agent_id: str, agent_config: dict) -> str:
        """
        Package the agent's code and dependencies.
        :param agent_id: Unique ID of the agent.
        :param agent_config: Configuration for the agent (e.g., code path, dependencies).
        :return: Path to the packaged artifact.
        """
        pass

    @abstractmethod
    def build(self, package_path: str, build_config: dict) -> str:
        """
        Build the packaged agent into a runnable artifact.
        :param package_path: Path to the packaged artifact.
        :param build_config: Configuration for the build process (e.g., Dockerfile path, target runtime).
        :return: Path to the built artifact (e.g., Docker image, binary file).
        """
        pass

    @abstractmethod
    def deploy(self, build_artifact: str, deploy_config: dict) -> str:
        """
        Deploy the built artifact to the target runtime.
        :param build_artifact: Path to the built artifact.
        :param deploy_config: Configuration for deployment (e.g., runtime type, resource allocation).
        :return: Deployment ID for tracking.
        """
        pass

    @abstractmethod
    def rollback(self, deployment_id: str) -> bool:
        """
        Rollback to a previous deployment.
        :param deployment_id: Unique ID of the deployment to rollback.
        :return: Success or failure.
        """
        pass

    @abstractmethod
    def list_deployments(self, agent_id: str) -> list:
        """
        List all deployments for a given agent.
        :param agent_id: Unique ID of the agent.
        :return: List of deployment IDs and metadata.
        """
        pass
