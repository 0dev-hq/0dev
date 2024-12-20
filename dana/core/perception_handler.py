from core.agent_context import AgentContext


class PerceptionHandler:
    def __init__(self, llm_client):
        """
        Initialize the perception handler with a language model client.
        :param llm_client: An OpenAI client for generating plans.
        """

        self.llm_client = llm_client

    def generate_confirmation(self, user_input: str, context: AgentContext) -> str:
        """
        Generate a confirmation message using LLM.
        :param user_input: Input string from the user or agent.
        :param context: Context of the agent (includes history, intents, facts, policies).
        """

        print(f"_build_confirmation_prompt params: {user_input}, {context}")

        # Generate the confirmation using the LLM
        llm_response = self.llm_client.answer(
            prompt=self._build_confirmation_prompt(user_input, context),
            format="json",
        )

        return llm_response

    def _build_confirmation_prompt(self, user_input: str, context: AgentContext) -> list:
        """
        Build a prompt for the LLM to generate a confirmation message.
        """

        system_content = f"""You are the brain of an agent that is constrained by its intents list and policies.
            The agent has dynamically generated a code and is waiting for the user's confirmation.
            You have to identify the code and inputs based on the user's input and the history of interactions.
            The code and inputs you identify will be used to generate a confirmation message for the user.
            Your answer should be in JSON format with these keys: 
            - 'reference_id': The reference ID of the generated code.
            - 'version': The version of the generated code to be confirmed.(default to 'latest')
            - 'input': A JSON object containing the inputs required for the code execution. The inputs should match the parameters needed by the code.
            The purpose of the confirmation is to ensure that the user agrees with the generated plan.
            Context:
            History of interactions with the user: {context.get('history', 'No history available')}
            """
        user_content = f"Generate a confirmation message as described, with this as user's latest input: '{user_input}'."

        return [
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content},
        ]

    def generate_perception(self, user_input: str, context: AgentContext) -> str:
        """
        Generate a perception (a question or representing options) using LLM.
        :param user_input: Input string from the user or agent.
        :param context: Context of the agent (includes history, intents, facts, policies).
        """

        print(f"_build_perception_prompt params: {user_input}, {context}")

        # Generate the perception using the LLM
        llm_response = self.llm_client.answer(
            prompt=self._build_perception_prompt(user_input, context),
            format="json",
        )

        return llm_response

    def _build_perception_prompt(
        self, user_input: str, context: AgentContext, max_options: int = 4
    ) -> list:
        """
        Build a prompt for the LLM to generate a perception.
        """
        intents_summary = "\n".join(
            [f",{intent}" for intent in context.get("intents", [])]
        )

        system_content = f"""You are the brain of an agent that is constrained by its intents list and policies.
            You have to generate a perception for the agent to ask the user.
            Your answer should be in JSON format.
            The purpose of the perception is to gather more information or provide options to the user.
            If you're focusing on executing a code (aka plan) according to the user's input and the history of interactions,
            while you haven't got all the necessary information to pass to the executor,
            you should generate a question and try to get as much information as possible with a single question.
            A perception cannot be asking for a confirmation of execution of a plan. We have a separate function for that.
            If you're asking for more information, try to gather as much information as possible with a single question, especially if 
            you are doing this to prepare for executing a plan.
            You can answer in only two formats: 'question' or 'options'.
            If you choose 'question', your answer will be in the format: {{'type': 'question', 'content': 'Your question based on the user input'}}.
            If you choose 'options', your answer will be in the format: {{'type': 'options', 'explanation': 'Your explanation based on the user input', 'options': ['Option 1', ...]}}.
            If you choose 'options', you can provide up to {max_options} options based on the allowed intents or an arbitrary combination of them.
            Context:
            History of interactions with the user: {context.get('history', 'No history available')}
            Allowed intents: {intents_summary}
            Policies: {context.get('policies', 'No policies available')}
            """
        user_content = f"Generate a perception as described, with this as user's latest input: '{user_input}'."

        return [
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content},
        ]
