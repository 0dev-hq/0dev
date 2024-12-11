from core.base_agent import BaseAgent
from core.navigator import Navigator
from core.planner import Planner
from core.base_history_manager import BaseHistoryManager


class InteractiveAgent(BaseAgent):
    """
    An agent that interacts with the user to perform actions.
    Internally uses Navigator for deciding the next step and Planner for generating actions.
    Uses a HistoryManager for managing interaction history.
    """

    def __init__(self, id: str, name: str, planner: Planner, navigator: Navigator, history_manager: BaseHistoryManager, 
                 intent_set: list, action_set: list, policy_set: list, sensor_set: list, account_id: str):
        """
        Initialize the InteractiveAgent with the Navigator, Planner, and HistoryManager.
        
        :param id: Unique ID of the agent.
        :param name: Unique name of the agent.
        :param planner: Instance of Planner for generating plans.
        :param navigator: Instance of Navigator for deciding the next step.
        :param history_manager: Instance of HistoryManager for managing interaction history.
        :param intent_set: Set of intents supported by the agent.
        :param action_set: Set of actions supported by the agent.
        :param policy_set: Set of policies defining agent behavior.
        :param sensor_set: Set of sensors supported by the agent.
        :param account_id: Account ID associated with the agent.
        """
        super().__init__(id, name, agent_type="Interactive")
        self.sensor_set = sensor_set
        self.policy_set = policy_set
        self.action_set = action_set
        self.intent_set = intent_set
        self.navigator = navigator
        self.planner = planner
        self.history_manager = history_manager
        self.account_id = account_id

    def get_identity(self) -> str:
        """
        Return the identity of the agent.
        """
        return f"Interactive Agent: {self.name}"

    def interact(self, user_input: str, session_id: str):
        """
        Engage with the user to process input and determine actions or perceptions.
        
        :param user_input: Input string from the user.
        :param session_id: The session ID for this interaction.
        :return: A dictionary representing the agent's response or next step.
        """
        # Retrieve the current history and context
        context = self._get_context(session_id)

        # Step 1: Use Navigator to determine the next step type
        next_step_type = self.navigator.get_next_step_type(user_input, context)
        print(f"Next Step Type: {next_step_type}")

        # Step 2: Generate the next step based on the type
        if next_step_type == "action":
            # Generate and execute the action plan
            action_plan = self.planner.generate_action_plan(
                task_description=user_input,
                environment=context.get("environment", "internal"),
                allowed_actions=context.get("actions", ["*"]),
                allowed_sensors=context.get("sensors", ["*"])
            )
            self._save_interaction(session_id, user_input, {"type": "action", "plan": action_plan})
            return {"type": "action", "plan": action_plan}

        elif next_step_type == "perception":
            # Generate perception content
            allowed_intents = context.get("intent_set", ["*"])
            perception = self.planner.generate_perception(user_input, context, allowed_intents)
            self._save_interaction(session_id, user_input, {"type": "perception", "content": perception})
            return {"type": "perception", "content": perception}

        else:
            error_message = f"Invalid step type determined: {next_step_type}"
            self._save_interaction(session_id, user_input, {"type": "error", "message": error_message})
            return {"type": "error", "message": error_message}
        
    def _get_context(self, session_id: str) -> dict:
        """
        Get the current context of the agent, including history and configurations.
        
        :param session_id: The session ID for this interaction.
        :return: A dictionary representing the current context.
        """
        history = self.history_manager.get_summary(
            account_id=self.account_id,
            agent_id=self.id,
            session_id=session_id
        )
        return {
            "history": history,
            "intents": self.intent_set,
            "actions": self.action_set,
            "sensors": self.sensor_set,
            "policies": self.policy_set
        }

    def _save_interaction(self, session_id: str, user_input: str, response: dict):
        """
        Save the interaction to the history manager.
        
        :param session_id: The session ID for this interaction.
        :param user_input: The user's input string.
        :param response: The agent's response or action plan.
        """
        interaction = {
            "user_input": user_input,
            "response": response
        }
        self.history_manager.save_interaction(
            account_id=self.account_id,
            agent_id=self.id,
            session_id=session_id,
            interaction=interaction
        )
