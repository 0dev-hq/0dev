class Planner:
    """
    A planner that uses LLM to generate a task execution DAG.
    Integrates with the ActionSensorRegistry for available actions and sensors.
    """

    def __init__(self, llm_client, action_sensor_registry):
        """
        Initialize the planner with required dependencies.
        
        :param llm_client: An OpenAI client for generating plans.
        :param action_sensor_registry: Registry for retrieving actions and sensors.
        """
        self.llm_client = llm_client
        self.action_sensor_registry = action_sensor_registry
    
    def generate_perception(self, user_input: str, context: dict, allowed_intents: list) -> str:
        """
        Generate a perception (a question or representing options) using LLM.

        :param user_input: Input string from the user or agent.
        :param context: Current state and history of actions.
        :param allowed_intents: List of allowed intents
        :return: A dict with type (question/options) and content (question/options)
        """

        # Generate the perception using the LLM
        llm_response = self.llm_client.answer(
            prompt = self._build_perception_prompt(user_input, context, allowed_intents),
            format = "json",
        )
        
        return llm_response
    
    def _build_perception_prompt(self, user_input: str, context: dict, allowed_intents: list) -> list:
        """
        Build a prompt for the LLM to generate a perception.
        """
        intents_summary = "\n".join(
            [f",{intent}" for intent in allowed_intents]
        )
        prompt_content = (
            f"Generate a perception as described for the user input: '{user_input}'. Allowed intents: {intents_summary}." # ignoring context for now
        )

        system_content = (
            f"You are an agent's brain that is asked to generate a perception for the agent to ask the user."
            f"Your answer should be in JSON format."
            f"You can answer in only two formats: 'question' or 'options'."
            f"If you choose 'question', your answer will be in the format: {{'type': 'question', 'content': 'Your question based on the user input'}}." # ignoring context for now
            f"If you choose 'options', your answer will be in the format: {{'type': 'options', 'explanation': 'Your explanation based on the user input', 'options': ['Option 1', 'Option 2', 'Option 3']}}."
            f"If you choose 'options', you can provide up to 4 options based on the allowed intents or an arbitrary combination of them."
        )

        return [{"role": "system", "content": system_content},
                {"role": "user",  "content": prompt_content}]
        

    def generate_action_plan(self, task_description: str, environment: str, allowed_actions: list, allowed_sensors: list) -> str:
        """
        Generate a task execution plan (DAG) using LLM and the action-sensor registry.
        
        :param task_description: String describing what is supposed to happen.
        :param environment: Execution environment (e.g., "internal", "airflow").
        :param allowed_actions: List of allowed actions ("*" for all or specific tags/descriptions).
        :param allowed_sensors: List of allowed sensors ("*" for all or specific tags/descriptions).
        :return: A JSON representation of the generated plan in string format.
        """
        if not task_description:
            raise ValueError("Task description cannot be empty.")
        if not environment:
            raise ValueError("Environment cannot be empty.")
        if not allowed_actions:
            raise ValueError("Allowed actions cannot be empty.")
        if not allowed_sensors:
            raise ValueError("Allowed sensors cannot be empty.")

        # Query the registry for available actions and sensors
        available_actions = self._get_available_actions(allowed_actions)
        available_sensors = self._get_available_sensors(allowed_sensors)

        # Get detailed information for available actions and sensors
        action_details = self.action_sensor_registry.get_action_details([item["name"] for item in available_actions])
        sensor_details = self.action_sensor_registry.get_sensor_details([item["name"] for item in available_sensors])

        # Generate the plan using the LLM
        llm_response = self.llm_client.answer(
            prompt = self._build_action_plan_prompt(task_description, environment, action_details, sensor_details),
            format = "json",
        )
        
        return llm_response

    def _get_available_actions(self, allowed_actions: list) -> list:
        """
        Retrieve available actions based on tags or descriptions.
        """
        if "*" in allowed_actions:
            return self.action_sensor_registry.list_actions("")
        return self.action_sensor_registry.list_actions(" ".join(allowed_actions))

    def _get_available_sensors(self, allowed_sensors: list) -> list:
        """
        Retrieve available sensors based on tags or descriptions.
        """
        if "*" in allowed_sensors:
            return self.action_sensor_registry.list_sensors("")
        return self.action_sensor_registry.list_sensors(" ".join(allowed_sensors))

    def _build_action_plan_prompt(self, task_description: str, environment: str, action_details: list, sensor_details: list) -> list:
        """
        Build a prompt for the LLM to generate a DAG.
        """
        actions_summary = "\n".join(
            [f"- {action['name']}: {action['description']}" for action in action_details]
        )
        sensors_summary = "\n".join(
            [f"- {sensor['name']}: {sensor['description']}" for sensor in sensor_details]
        )
        prompt_content = (
            f"Generate a DAG (in JSON format) for the task: '{task_description}'. "
            f"The available actions are:\n{actions_summary}\n"
            f"The available sensors are:\n{sensors_summary}\n"
            f"Include parameters for each action and define dependencies if the output of one action "
            f"is used by another action."
        )
        return [{"role": "system", "content": f"You are a planner for the {environment} environment that responds only in JSON format."},
                {"role": "user", "content": prompt_content}]
