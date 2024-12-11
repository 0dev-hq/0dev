from abc import ABC, abstractmethod

class Runtime(ABC):
    """
    Abstract base class for agent runtimes.
    Provides execution mechanisms and runtime-specific telemetry.
    """

    @abstractmethod
    def run_agent(self, agent_id: str, agent_artifact: str, config: dict) -> str:
        """
        Run an agent using the provided artifact and configuration.
        :param agent_id: Unique ID of the agent.
        :param agent_artifact: Path or reference to the deployed artifact.
        :param config: Runtime-specific configurations (e.g., resource limits).
        :return: Runtime instance ID.
        """
        pass

    @abstractmethod
    def stop_agent(self, runtime_instance_id: str) -> bool:
        """
        Stop a running agent instance.
        :param runtime_instance_id: Unique ID of the runtime instance.
        :return: Success or failure.
        """
        pass

    @abstractmethod
    def get_metrics(self, runtime_instance_id: str) -> dict:
        """
        Get telemetry and metrics for a running agent instance.
        :param runtime_instance_id: Unique ID of the runtime instance.
        :return: Dictionary of metrics (e.g., CPU usage, uptime).
        """
        pass

    @abstractmethod
    def describe(self) -> dict:
        """
        Provide runtime-specific details and capabilities.
        :return: Dictionary of runtime details (e.g., resource limits, version).
        """
        pass
