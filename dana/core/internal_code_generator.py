import logging
import traceback
from core.agent_context import AgentContext
from core.base_code_generator import BaseCodeGenerator, GeneratedCodeFormat

logger = logging.getLogger(__name__)


class InternalCodeGenerator(BaseCodeGenerator):
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
                    Allowed agent intents: {', '.join(context.get('intents', []))}
                    Facts: {', '.join(context.get('facts', []))}
                    Policies: {', '.join(context.get('policies', []))}
                    Communication history: {', '.join(context.get('history', []))}
                    Output the result as a JSON object with two properties: "code" and "requirements.
                    - code: Python code fulfilling the task. The code shouldn't use any placeholder values and environment variables. All inputs must be passed as function arguments.
                    - requirements: List of Python packages required for the code.
                    - name: A unique name that describes the code. While being concise, try to make it descriptive enough to easily which scenario the code is used for.
                    - description: A brief description of the code.
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

            return {
                "code": response.code,
                "requirements": response.requirements,
                "name": response.name,
                "description": response.description,
            }
        except Exception as e:
            logger.error(f"Error generating code: {e}")
            logger.error(f"Error details: {traceback.format_exc()}")
            return {"code": "", "requirements": [], "name": "", "description": ""}
