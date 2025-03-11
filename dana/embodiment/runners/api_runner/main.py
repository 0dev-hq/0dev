import os
import json
import logging
from core.info.answer_handler import AnswerHandler
from core.interactive_agent import InteractiveAgent
from core.code_generation.local_code_generator import LocalCodeGenerator
from core.execution.local_code_executor import LocalCodeExecutor
from core.job_management.job_manager import JobManager
from core.navigation.navigator import Navigator
from core.perception.perception_handler import PerceptionHandler
from core.history_management.postgres_history_manager import PostgresHistoryManager
from core.navigation.step_handler import StepHandler
from embodiment.runners.api_runner.api_runner import APIRunner
from core.llms.openai import OpenAIClient


def load_agent_config(config_path: str) -> dict:
    """
    Load the agent configuration from a given JSON file path.
    :param config_path: Path to the agent configuration file.
    :return: Dictionary containing the agent configuration.
    """

    for key, value in os.environ.items():
        print(f"main.py -> {key}: {value}")

    if not os.path.exists(config_path):
        raise FileNotFoundError(f"Configuration file not found at: {config_path}")

    with open(config_path, "r") as config_file:
        return json.load(config_file)


def configure_logger(agent_id: str) -> object:
    """
    Configure the logger for the agent.
    """
    logging.basicConfig(
        format=f"{agent_id}- %(asctime)s ::: %(message)s", level=logging.INFO
    )


if __name__ == "__main__":

    print("Loading agent configuration...")
    config_path = os.getenv("AGENT_CONFIG_PATH")
    if not config_path:
        raise EnvironmentError("AGENT_CONFIG_PATH environment variable is not set.")

    # Load agent configuration
    agent_config = load_agent_config(config_path)

    configure_logger(agent_id=agent_config["id"])

    # Initialize dependencies
    llm_client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))

    navigator = Navigator(llm_client)
    history_manager = PostgresHistoryManager(llm_client)
    code_generator = LocalCodeGenerator(llm_client)
    job_manager = JobManager(
        auth_token=agent_config["auth_token"], dana_url=os.getenv("DANA_URL")
    )
    code_executor = LocalCodeExecutor(job_manager=job_manager, history_manager=history_manager)
    perception_handler = PerceptionHandler(llm_client)
    answer_handler = AnswerHandler(llm_client)
    step_handler = StepHandler(
        code_generator=code_generator,
        history_manager=history_manager,
        perception_handler=perception_handler,
        code_executor=code_executor,
        answer_handler=answer_handler,
    )

    del agent_config["auth_token"]

    # Inject dependencies into the agent configuration
    agent_config.update(
        {
            "navigator": navigator,
            "step_handler": step_handler,
            "history_manager": history_manager,
        }
    )

    # Initialize the runner with the InteractiveAgent and dynamic config
    runner = APIRunner(
        agent_class=InteractiveAgent,
        agent_config=agent_config,
    )

    # Run the API server
    port = int(os.getenv("FLASK_RUN_PORT", 5001))
    runner.run(port=port)
