from abc import ABC, abstractmethod
from core.job_management.job_manager import JobManager
from core.interaction_manager.interaction_manager import InteractionManager
from core.perception.perception_handler import InputItemFormat


class BaseCodeExecutor(ABC):
    def __init__(self, job_manager: JobManager, interaction_manager: InteractionManager):
        self.job_manager = job_manager
        self.interaction_manager = interaction_manager

    @abstractmethod
    def execute_code(
        account_id: str,
        agent_id: str,
        session_id: str,
        code: str,
        requirements: list,
        inputs: list[InputItemFormat],
        secrets: dict,
        integrations: dict,
        name: str,
        description: str,
    ):
        """
        Execute the job and update its status in the database.

        :param account_id: The account ID.
        :param agent_id: The agent ID.
        :param session_id: The session ID.
        :param code: The code to execute.
        :param requirements: The requirements for the code.
        :param inputs: The inputs for the code.
        :param secrets: The secrets required by the code.
        :param integrations: The integrations required by the code.
        :param name: The name of the job.
        :param description: The description of the job.

        """
        pass
