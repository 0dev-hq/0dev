import logging
from enum import Enum

logger = logging.getLogger(__name__)


class NextStep(Enum):
    PLAN = "plan"  # Generate a task plan or custom code
    ANSWER = "answer"  # Generate an answer to a question
    Question = "question"  # Ask for more information
    Option = "option"  # Provide options to choose from
    CONFIRM_EXECUTION = "confirm_execution"  # Require user confirmation for execution
    EXECUTE = "execute"  # Execute a confirmed plan
    NONE = "none"  # Deny the request


class Navigator:
    """
    A decision-making entity for agents operating in act-perceive modes.
    Delegates decision-making to the Planner and executes the generated step.
    """

    def __init__(self, llm_client):
        """
        Initialize the Navigator with required dependencies.

        :param llm_client: An OpenAI client for decision-making and queries.
        :param action_sensor_registry: Registry for retrieving actions and sensors.
        """
        self.llm_client = llm_client

    def get_next_step_type(self, user_input: str, context: dict) -> NextStep:
        """
        Determine and generate the next step based on user input and context.

        :param user_input: Input string from the user or agent.
        :param context: Current state and history of actions.
        :return: The type of the next step to be taken.
        """

        next_step = self.llm_client.answer(
            prompt=self._create_prompt(user_input, context)
        )

        return NextStep(next_step)

    def _create_prompt(self, user_input: str, context: dict) -> str:
        """
        Create a prompt for the LLM based on user input and context.

        :param user_input: Input string from the user or agent.
        :param context: Current state and history of actions.
        :return: A formatted prompt string for the LLM.
        """
        prompt = [
            {
                "role": "system",
                "content": f"""You are the decision-making brain of an intelligent, efficient assistant agent.
                The user asks agent to perform some tasks, and the agent has to generate a plan(python code), 
                and then gather inputs required for the plan. Once the plan and the inputs are ready, 
                the agent should ask the user for confirmation before executing the plan.
                Your role is to decide the agent's next step based on user input, history, and the current context.
                Help the agent move towards the goal of fulfilling the user's request efficiently and effectively.
                If you're focusing on executing a code (aka plan) according to the user's input and the history of interactions,
                while you haven't got all the necessary information to pass to the executor,
                you should generate a question and try to get as much information as possible with a single question.
                If you can provide options to choose from, you should do so to help the user make a decision.
                Note that agent is constrained by its intents, policies, and available actions.
                Your response should be one of the following options without any explanation, punctuation, or additional information or formatting:
                1. {NextStep.PLAN.value}: If the agent needs to generate a plan or custom code to fulfill the user's request.
                2. {NextStep.Question.value}: If the agent needs to ask the user for more information to proceed with the request.
                3. {NextStep.Option.value}: If the agent needs to provide options to choose from.
                4. {NextStep.CONFIRM_EXECUTION.value}: If the agent is ready to execute a plan and has already gathered all the necessary information. Confirmation is required before executing the plan.
                5. {NextStep.EXECUTE.value}: If the agent has received confirmation and is ready to execute the plan. This step can only occur if the user has explicitly approved the plan.
                6. {NextStep.NONE.value}: If the request is outside the agent's scope, violates policies, or cannot be fulfilled.
                7. {NextStep.ANSWER.value}: If the agent needs to generate an answer to a question based on the user's input and the context.
                """,
            },
            {
                "role": "system",
                "content": f"Facts: {context.get('facts', 'No facts available')}",
            },
            {
                "role": "system",
                "content": f"Agent's allowed intents: {context.get('intents', 'No intents available')}",
            },
            {
                "role": "system",
                "content": f"Agent's policies: {context.get('policies', 'No policies available')}",
            },
            {
                "role": "system",
                "content": f"History of interactions with the user: {context.get('history', 'No history available')}",
            },
            {
                "role": "system",
                "content": """If you don't have enough information but are allowed to act based on the intents and policies, 
                prioritize asking the user for more details (`perception`) instead of proceeding with incomplete or placeholder values.""",
            },
            {
                "role": "user",
                "content": f"User's latest input: '{user_input}'. What should the agent do next?",
            },
        ]

        logger.info(f"Generated prompt: {prompt}")

        return prompt
