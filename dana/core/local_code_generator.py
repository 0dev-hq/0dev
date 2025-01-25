import logging
import traceback
from core.agent_context import AgentContext
from core.base_code_generator import BaseCodeGenerator, GeneratedCodeFormat

logger = logging.getLogger(__name__)


class LocalCodeGenerator(BaseCodeGenerator):
    """
    A concrete implementation of BaseCodeGenerator to generate code
    that runs inside the agent.
    """

    def __init__(self, llm_client):
        """
        Initialize the InternalCodeGenerator with the LLM client.
        :param llm_client: The LLM client to generate code.
        """
        super().__init__(llm_client)

    def _create_prompt(self, user_input, context: AgentContext):
        """
        Create a prompt for the LLM based on the task and context.
        :param user_input: The user's latest input.
        :param intents: The list of agent intents.
        :param facts: The list of facts.
        :param policies: The list of policies.
        :return: A formatted prompt as a string.
        """

        secrets = {
            secret["name"]: secret["description"]
            for secret in context.get("secrets", [])
        }

        return [
            {
                "role": "system",
                "content": "You are an advanced code generation assistant tasked with creating Python code to fulfill specific tasks inside an intelligent agent. "
                "Ensure the code is modular, concise, and follows Python best practices. The answer should also include required dependencies.",
            },
            {
                "role": "user",
                "content": f"""
                    User's latest input: {user_input}
                    Allowed agent intents: {context.get('intents', 'No intents available')}
                    Facts: {context.get('facts', 'No facts available')}
                    Policies: {context.get('policies', 'No policies available')}
                    Secrets: {secrets if secrets else 'No secrets available'}
                    Communication history: {context.get('history', 'No history available')}
                    Output the result as a JSON object with properties: "code", "requirements", "secrets", "name", and "description".
                    - code: Python code fulfilling the task. The code shouldn't use any placeholder values and environment variables. All inputs must
                    be passed as function arguments.
                    - requirements: List of non-standard (third-party) Python packages required for the code. The packages will be installed using
                    pip. Do not include standard library packages like 'os' or 'sys', only third-party packages.
                    - secrets: List of secrets required for the code. If any secret is used in the code, it's exact name from the secrets list should
                    be used.
                    - name: A unique name that describes the code. While being concise, try to make it descriptive enough to easily which scenario
                    the code is used for.
                    - description: A brief description of the code.
                    Notes:
                    - The code MUST have a function named 'main' that takes all the required inputs as arguments.
                    - The `main` function MUST be the entry point of the code, but you can have additional functions if needed.
                    - All the code MUST be contained within a single file.
                    - DO NOT CALL THE 'main' FUNCTION IN THE CODE.
                    - If any secret is used in the code, the 'main' function should take an argument named 'secrets' which is a dictionary containing
                    all the secrets required by the code.
                    - NO hard-coded values should be present in the code. All values should be passed as arguments to the 'main' function even if it
                    causes to have many arguments. It's common for users to ask for a vague task, it's better to have many arguments than to have
                    hard-coded or placeholder values. The values of the arguments will be later provided by the user.
                    - Do not use any dummy values unless explicitly mentioned in the user input.
                    - AVOID using any placeholder values in the code. Even if the value is constant, e.g. how many retries to attempt, it should be
                    passed as an argument to the 'main' function.
                    """,
            },
        ]

    def generate(self, user_input: str, context: AgentContext) -> GeneratedCodeFormat:
        try:
            # Call LLM client to generate code and requirements

            response = self.llm_client.answer(
                prompt=self._create_prompt(user_input, context=context),
                formatter=GeneratedCodeFormat,
            )
            logger.info(f"Generated response: {response}")

            return response
        except Exception as e:
            logger.error(f"Error generating code: {e}")
            logger.error(f"Error details: {traceback.format_exc()}")
            return {"code": "", "requirements": [], "name": "", "description": ""}
