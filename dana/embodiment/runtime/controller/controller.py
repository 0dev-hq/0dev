from abc import ABC, abstractmethod


class Controller(ABC):
    """
    Abstract base class for managing and orchestrating agents.
    Handles scaling, monitoring, fault recovery, and scheduling.
    """

    @abstractmethod
    def scale_agent(self, agent_id: str, scale_config: dict) -> bool:
        """
        Scale the number of instances of an agent.
        :param agent_id: Unique ID of the agent.
        :param scale_config: Configuration for scaling (e.g., number of replicas).
        :return: Success or failure.
        """
        pass

    @abstractmethod
    def monitor_agent(self, runtime_instance_id: str) -> dict:
        """
        Monitor the state and metrics of a running agent instance.
        :param runtime_instance_id: Unique ID of the runtime instance.
        :return: Dictionary of agent state and metrics.
        """
        pass

    @abstractmethod
    def recover_agent(self, runtime_instance_id: str) -> bool:
        """
        Recover a failed agent by restarting it.
        :param runtime_instance_id: Unique ID of the runtime instance.
        :return: Success or failure.
        """
        pass

    @abstractmethod
    def schedule_agent(self, agent_id: str, schedule: dict) -> bool:
        """
        Schedule an agent to start/stop at specific times.
        :param agent_id: Unique ID of the agent.
        :param schedule: Schedule configuration (e.g., cron expression).
        :return: Success or failure.
        """
        pass

    @abstractmethod
    def list_agents(self) -> list:
        """
        List all managed agents and their statuses.
        :return: List of agents and their runtime details.
        """
        pass
