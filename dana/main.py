from core.action_sensor_registry import ActionSensorRegistry
from core.interactive_agent import InteractiveAgent
from core.llms.openai import OpenAIClient
import os
from dotenv import load_dotenv

load_dotenv()


def main():
    # Initialize components
    llm_client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))
    # registry = ActionSensorRegistry()
    # registry.load("actions.yaml", "sensors.yaml")

    # Initialize the InteractiveAgent
    agent = InteractiveAgent(name="EmailAgent", 
                                id="1",
                                planner=None,
                                navigator=None,
                                history_manager=None,
                                intents=[
                                    "Answer questions about emails, the technology used, and the process.",
                                    "Give the list of files in the source bucket to the user."
                                    "Send an email with the files from the source that the user specifies to the recipient."
                                ],
                                facts=[
                                    "The source bucket is an S3 bucket named '0dev-test-source-bucket'.",
                                ],
                                policies=[
                                    "If a file's name starts with internal, don't send it in the email.",
                                ],
                                account_id="123")

    # Interaction 1: Perception
    print("\nInteraction 1: Perception")
    user_input_perception = "Can you tell me about what makes trees grow?"
    context_perception = {"current_state": "Idle", "history": []}
    response_perception = agent.interact(user_input_perception, context_perception)
    print("Agent Response:", response_perception)

    # # Interaction 2: Action
    # print("\nInteraction 2: Action")
    # user_input_action = "Monitor file changes and send an email report."
    # context_action = {
    #     "current_state": "Idle",
    #     "history": [],
    #     "allowed_actions": ["send_email", "generate_report"],
    #     "allowed_sensors": ["file_sensor"],
    #     "environment": "airflow"
    # }
    # response_action = agent.interact(user_input_action, context_action)
    # print("Agent Response:", response_action)

if __name__ == "__main__":
    main()
