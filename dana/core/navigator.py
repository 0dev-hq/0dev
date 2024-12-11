class Navigator:
    """
    A decision-making entity for agents operating in act-perceive modes.
    Delegates decision-making to the Planner and executes the generated step.
    """

    def __init__(self, llm_client, action_sensor_registry):
        """
        Initialize the Navigator with required dependencies.
        
        :param llm_client: An OpenAI client for decision-making and queries.
        :param action_sensor_registry: Registry for retrieving actions and sensors.
        """
        self.llm_client = llm_client
        self.action_sensor_registry = action_sensor_registry


    def get_next_step_type(self, user_input: str, context: dict) -> str:
        """
        Determine and generate the next step based on user input and context.
        
        :param user_input: Input string from the user or agent.
        :param context: Current state and history of actions.
        :return: A string representing the next step to be an action or a perception.
        """
        
        next_step = self.llm_client.answer(
            prompt = self._create_prompt(user_input, context),
            format = "text",
        )
        
        return next_step
    
    def _create_prompt(self, user_input: str, context: dict) -> str:
        """
        Create a prompt for the LLM based on user input and context.
        
        :param user_input: Input string from the user or agent.
        :param context: Current state and history of actions. Note: ignored for now.
        :return: A formatted prompt string for the LLM.
        """
        prompt = [
            {"role": "system", "content": "You are the brain of an agent that decides what to do next. Your answer can only be 'action' or 'perception' without any explanation or formatting."},
            {"role": "user", "content": f"History of interactions with the user: {context.get('history', 'No history available')}"},
            {"role": "user", "content": f"If you don't have enough information, ask the user for more details instead of using placeholders."},
            {"role": "user", "content": f"Based on the input '{user_input}', what should the agent do next?"},
        ]

        return prompt


    
