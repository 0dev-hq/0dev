import logging

from pydantic import BaseModel
from core.agent_context import AgentContext

logger = logging.getLogger(__name__)


class InputItemFormat(BaseModel):
    name: str
    value: str
    type: str

    def get_typed_value(self):
        if self.type == "int" or self.type == "integer" or self.type == "number":
            return int(self.value)
        elif self.type == "float" or self.type == "decimal" or self.type == "double":
            return float(self.value)
        elif self.type == "bool" or self.type == "boolean":
            return self.value.lower() in {"true", "1"}
        elif self.type == "dict":
            import json
            return json.loads(self.value)
        elif self.type == "list":
            import json
            return json.loads(self.value)
        else:
            return self.value


class ConfirmationFormat(BaseModel):
    reference_id: str
    version: str
    input: list[InputItemFormat]


class OptionsFormat(BaseModel):
    explanation: str
    options: list[str]


class PerceptionHandler:
    def __init__(self, llm_client):
        """
        Initialize the perception handler with a language model client.
        :param llm_client: An OpenAI client for generating plans.
        """

        self.llm_client = llm_client

    def generate_confirmation(
        self, user_input: str, context: AgentContext
    ) -> ConfirmationFormat:
        """
        Generate a confirmation message using LLM.
        :param user_input: Input string from the user or agent.
        :param context: Context of the agent (includes history, intents, facts, policies).
        """

        print(f"_build_confirmation_prompt params: {user_input}, {context}")

        # Generate the confirmation using the LLM

        response = self.llm_client.answer(
            prompt=self._build_confirmation_prompt(user_input, context),
            formatter=ConfirmationFormat,
        )

        return response

    def _build_confirmation_prompt(
        self, user_input: str, context: AgentContext
    ) -> list:
        """
        Build a prompt for the LLM to generate a confirmation message.
        """

        # - 'input': A JSON object containing the inputs required for the code execution. The inputs should match the parameters needed by the code.
        # If no inputs are required, set this to an empty object.
        system_content = f"""You are the brain of an agent that is constrained by its intents list and policies.
            The agent has dynamically generated a code and is waiting for the user's confirmation.
            You have to identify the code and inputs based on the user's input and the history of interactions.
            The code and inputs you identify will be used to generate a confirmation message for the user.
            Your answer should be in JSON format with these keys:
            - 'input': A list of input items required for the code execution. Each item should have a 'name', 'value' and 'type' field.
            The list should cover all the arguments
            of the 'main' function in the code. If no inputs are required, set this to an empty list.
            - 'reference_id': The reference ID of the generated code.
            - 'version': The version of the generated code to be confirmed. Set this to 'latest' to confirm the latest version.
            The purpose of the confirmation is to ensure that the user agrees with the generated plan.
            Context:
            History of interactions with the user: {context.get('history', 'No history available')}
            Facts: {context.get('facts', 'No facts available')}
            """
        user_content = f"Generate a confirmation message as described, with this as user's latest input: '{user_input}'."

        return [
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content},
        ]

    def generate_question(self, user_input: str, context: AgentContext) -> str:
        """
        Generate a question (a question or representing options) using LLM.
        :param user_input: Input string from the user or agent.
        :param context: Context of the agent (includes history, intents, facts, policies).
        """

        print(f"_build_question_prompt params: {user_input}, {context}")

        # Generate the question using the LLM
        llm_response = self.llm_client.answer(
            prompt=self._build_question_prompt(user_input, context),
        )

        logger.info(f"Generated question: {llm_response}")

        return llm_response

    def _build_question_prompt(
        self,
        user_input: str,
        context: AgentContext,
    ) -> list:
        """
        Build a prompt for the LLM to generate a question.
        """

        system_content = f"""You are the brain of an agent that is constrained by its intents list and policies.
            You have to generate a question for the agent to ask the user.
            The purpose of the question is to gather more information from the user to help the agent fulfill the user's request that 
            the agent has been following based on the user's input and the history of interactions.
            A question cannot be asking for a confirmation of execution of a plan. We have a separate function for that.
            If you're asking for more information, try to gather as much information as possible with a single question, especially if 
            you are doing this to prepare for executing a plan.
            Context:
            History of interactions with the user: {context.get('history', 'No history available')}
            Allowed intents: {context.get('intents', 'No intents available')}
            Facts: {context.get('facts', 'No facts available')}
            Policies: {context.get('policies', 'No policies available')}
            """
        user_content = f"Generate a question as described, with this as user's latest input: '{user_input}'."

        return [
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content},
        ]

    def generate_options(self, user_input: str, context: AgentContext) -> OptionsFormat:
        """
        Generate a question with options using LLM.

        :param user_input: Input string from the user or agent.
        :param context: Context of the agent (includes history, intents, facts, policies).
        """

        print(f"_build_options_prompt params: {user_input}, {context}")

        # Generate the question using the LLM
        llm_response = self.llm_client.answer(
            prompt=self._build_options_prompt(user_input, context),
            formatter=OptionsFormat,
        )

        logger.info(f"Generated options: {llm_response}")

        return llm_response

    def _build_options_prompt(
        self, user_input: str, context: AgentContext, max_options: int = 4
    ) -> list:
        """
        Build a prompt for the LLM to generate a question with options.
        """
        system_content = f"""You are the brain of an agent that is constrained by its intents list and policies.
            You have to generate multiple options for the agent to ask the user.
            Your answer should be in JSON format.
            The purpose of the options is to provide the user with a set of choices to select from based on the user's input and the history of interactions.
            Your answer must be in the format: {{'label': 'Your explanation based on the user input', 'options': ['Option 1', ...]}}.
            If you choose 'options', you can provide up to {max_options} options based on the allowed intents or an arbitrary combination of them.
            Context:
            History of interactions with the user: {context.get('history', 'No history available')}
            Allowed intents: {context.get('intents', 'No intents available')}
            Facts: {context.get('facts', 'No facts available')}
            Policies: {context.get('policies', 'No policies available')}
            """
        user_content = f"Generate options as described, with this as user's latest input: '{user_input}'."

        return [
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content},
        ]
