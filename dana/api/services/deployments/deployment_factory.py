import os
from api.services.deployments.local_api_deployment import LocalAPIDeployment
from api.services.deployments.base_deployment import BaseDeployment


class DeploymentFactory:
    """
    Factory for creating deployment strategy instances.
    Determines the strategy dynamically based on the environment variable AGENT_DEPLOYMENT_TYPE.
    """

    @staticmethod
    def create() -> BaseDeployment:
        deployment_type = os.getenv("AGENT_DEPLOYMENT_TYPE", "local_api")

        if deployment_type == "local_api":
            return LocalAPIDeployment()
        else:
            raise ValueError(f"Unsupported deployment type: {deployment_type}")
