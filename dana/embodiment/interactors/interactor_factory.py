from .base_interactor import BaseInteractor
from .api_interactor import APIInteractor
import os


class InteractorFactory:
    """
    Factory for creating interactor strategy instances.
    Determines the strategy dynamically based on the environment variable AGENT_DEPLOYMENT_TYPE.
    """

    @staticmethod
    def create() -> BaseInteractor:
        """
        Return an instance of the specified strategy.
        """
        deployment_type = os.getenv("AGENT_DEPLOYMENT_TYPE", "local_api")

        if deployment_type == "local_api":
            return APIInteractor()
        else:
            raise ValueError(f"Unsupported deployment type: {deployment_type}")
