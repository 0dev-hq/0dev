from core.interactive_agent import InteractiveAgent
from core.navigator import Navigator
from core.planner import Planner
from core.action_sensor_registry import ActionSensorRegistry
from core.postgres_history_manager import PostgresHistoryManager
from embodiment.runners.api_runner.api_runner import APIRunner
from core.llms.openai import OpenAIClient
import os
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    # Initialize dependencies
    llm_client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))
    registry = ActionSensorRegistry()
    registry.load("actions.yaml", "sensors.yaml")
    planner = Planner(llm_client, registry)
    navigator = Navigator(llm_client, registry)
    history_manager = PostgresHistoryManager(llm_client)

    # Initialize the runner with the agent
    runner = APIRunner(
        agent_class=InteractiveAgent, 
        agent_config={
            "id": "1",
            "account_id": "123",
            "name": "MyInteractiveAgent",
            "intent_set":["support_ticket", "send_email", "query_data"],
            "action_set":["send_email", "generate_report"],
            "sensor_set":["s3_file_sensor", "email_sensor"],
            "policy_set":[
                "Don't generate a report without confirmation from the user.",
                "Send an email with the report as an attachment.",
                "Notify the user if the report generation fails.",
            ],
            "navigator": navigator,
            "planner": planner,
            "history_manager": history_manager,
        }
    )
    runner.run()
