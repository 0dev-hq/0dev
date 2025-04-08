import os
import json
import logging
from dotenv import load_dotenv
from core.info.answer_handler import AnswerHandler
from core.interactive_agent import InteractiveAgent
from core.code_generation.local_code_generator import LocalCodeGenerator
from core.execution.local_code_executor import LocalCodeExecutor
from core.job_management.job_manager import JobManager
from core.navigation.navigator import Navigator
from core.perception.perception_handler import PerceptionHandler
from core.interaction_manager.interaction_manager import InteractionManager
from core.navigation.step_handler import StepHandler
from embodiment.runners.api_runner.api_runner import APIRunner
from core.llms.openai import OpenAIClient
from core.llms.llm_factory import LLMFactory

load_dotenv()


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

    print(f"BASIC_LLM_PROVIDER: {os.getenv('BASIC_LLM_PROVIDER')}")
    print(f"BASIC_LLM_API_KEY: {os.getenv('BASIC_LLM_API_KEY')}")
    print(f"BASIC_LLM_MODEL: {os.getenv('BASIC_LLM_MODEL')}")

    print(f"REASONING_LLM_PROVIDER: {os.getenv('REASONING_LLM_PROVIDER')}")
    print(f"REASONING_LLM_API_KEY: {os.getenv('REASONING_LLM_API_KEY')}")
    print(f"REASONING_LLM_MODEL: {os.getenv('REASONING_LLM_MODEL')}")

    print(f"CODE_GEN_LLM_PROVIDER: {os.getenv('CODE_GEN_LLM_PROVIDER')}")
    print(f"CODE_GEN_LLM_API_KEY: {os.getenv('CODE_GEN_LLM_API_KEY')}")
    print(f"CODE_GEN_LLM_MODEL: {os.getenv('CODE_GEN_LLM_MODEL')}")

    basic_llm_client = LLMFactory.create(
        provider=os.getenv("BASIC_LLM_PROVIDER"),
        api_key=os.getenv("BASIC_LLM_API_KEY"),
        model=os.getenv("BASIC_LLM_MODEL"),
    )

    reasoning_llm_client = LLMFactory.create(
        provider=os.getenv("REASONING_LLM_PROVIDER"),
        api_key=os.getenv("REASONING_LLM_API_KEY"),
        model=os.getenv("REASONING_LLM_MODEL"),
    )

    code_gen_llm_client = LLMFactory.create(
        provider=os.getenv("CODE_GEN_LLM_PROVIDER"),
        api_key=os.getenv("CODE_GEN_LLM_API_KEY"),
        model=os.getenv("CODE_GEN_LLM_MODEL"),
    )

    code_review_llm_client = LLMFactory.create(
        provider=os.getenv("CODE_REVIEW_LLM_PROVIDER"),
        api_key=os.getenv("CODE_REVIEW_LLM_API_KEY"),
        model=os.getenv("CODE_REVIEW_LLM_MODEL"),
    )

    # Initialize dependencies

    navigator = Navigator(reasoning_llm_client)
    interaction_manager = InteractionManager(
        llm_client=basic_llm_client,
        auth_token=agent_config["auth_token"],
        dana_url=os.getenv("DANA_URL"),
    )
    code_generator = LocalCodeGenerator(code_gen_llm_client)
    job_manager = JobManager(
        auth_token=agent_config["auth_token"], dana_url=os.getenv("DANA_URL")
    )
    code_executor = LocalCodeExecutor(
        job_manager=job_manager, interaction_manager=interaction_manager
    )
    perception_handler = PerceptionHandler(basic_llm_client)
    answer_handler = AnswerHandler(basic_llm_client)
    step_handler = StepHandler(
        code_generator=code_generator,
        history_manager=interaction_manager,
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
            "interaction_manager": interaction_manager,
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
