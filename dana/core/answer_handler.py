from core.agent_context import AgentContext


class AnswerHandler:
    """
    Handles generating answers using the LLM based on the user input, context, history, facts, and policies.
    """

    def __init__(self, llm_client):
        """
        Initialize the AnswerHandler with the LLM client.

        :param llm_client: The LLM client to generate answers.
        """
        self.llm_client = llm_client

    def generate_answer(self, user_input: str, context: AgentContext) -> str:
        """
        Generate an answer from the LLM based on the user input and agent context.

        :param user_input: The user's latest input.
        :param context: AgentContext containing history, facts, intents, and policies.
        :return: The LLM-generated answer as a string.
        """
        prompt = self._build_prompt(user_input, context)
        print(f"Generated Answer Prompt: {prompt}")

        llm_response = self.llm_client.answer(prompt=prompt)
        return llm_response.strip()

    def _build_prompt(self, user_input: str, context: AgentContext) -> list:
        """
        Build a prompt for the LLM based on user input, history, and facts.

        :param user_input: The user's latest input.
        :param context: The agent's context.
        :return: A structured prompt as a list of system/user roles.
        """
        system_content = f"""You are the brain of an intelligent agent tasked with providing clear, concise, and context-aware answers 
        to user queries. You must generate a response considering the agent's allowed intents, facts, policies, and the history of 
        interactions. Be precise and helpful in your answer.

        Context:
        - Intents: {context.get('intents', [])}
        - Facts: {context.get('facts', [])}
        - Policies: {context.get('policies', [])}
        - Interaction History: {context.get('history', [])} if context.get('history') else 'No previous history available.'
        """
        user_content = (
            f"User's latest input: {user_input}\nProvide a relevant and concise answer."
        )

        return [
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content},
        ]
