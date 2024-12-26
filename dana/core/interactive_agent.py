from core.base_agent import BaseAgent
from core.base_code_executor import BaseCodeExecutor
from core.base_code_generator import BaseCodeGenerator
from core.navigator import Navigator
from core.base_history_manager import BaseHistoryManager
from core.step_handler import StepHandler


class InteractiveAgent(BaseAgent):
    """
    An agent that interacts with the user to perform actions.
    Internally uses Navigator for deciding the next step and Planner for generating actions.
    Uses a HistoryManager for managing interaction history.
    """

    def __init__(
        self,
        id: str,
        name: str,
        description: str,
        navigator: Navigator,
        step_handler: StepHandler,
        history_manager: BaseHistoryManager,
        intents: list,
        facts: list,
        policies: list,
        account_id: str,
    ):
        """
        Initialize the InteractiveAgent with the Navigator, Planner, and HistoryManager.

        :param id: Unique ID of the agent.
        :param name: Unique name of the agent.
        :param description: Description of the agent.
        :param navigator: Instance of Navigator for deciding the next step.
        :param step_handler: Instance of StepHandler for handling the next step.
        :param history_manager: Instance of HistoryManager for managing interaction history.
        :param code_generator: Instance of CodeGenerator for generating codes to implement actions.
        :param code_executor: Instance of CodeExecutor for executing generated code.
        :param intents: Set of intents supported by the agent.
        :param facts: Set of facts that give the agent context.
        :param policies: Set of policies defining agent behavior.
        :param account_id: Account ID associated with the agent.
        """
        super().__init__(id, name, description, agent_type="Interactive")
        self.policies = policies
        self.facts = facts
        self.intents = intents
        self.account_id = account_id
        self.navigator = navigator
        self.step_handler = step_handler
        self.history_manager = history_manager

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

        context = self._get_context(session_id)

        next_step_type = self.navigator.get_next_step_type(user_input, context)
        print(f"Next Step Type: {next_step_type}")

        response = self.step_handler.handle_step(
            step_type=next_step_type,
            user_input=user_input,
            context=context,
            session_id=session_id,
            account_id=self.account_id,
            agent_id=self.id,
        )

        return response

    def _get_context(self, session_id: str) -> dict:
        """
        Get the current context of the agent, including history and configurations.

        :param session_id: The session ID for this interaction.
        :return: A dictionary representing the current context.
        """
        history = self.history_manager.get_summary(
            account_id=self.account_id, agent_id=self.id, session_id=session_id
        )
        return {
            "history": history,
            "intents": self.intents,
            "facts": self.facts,
            "policies": self.policies,
        }

    def _save_interaction(self, session_id: str, user_input: str, response: dict):
        """
        Save the interaction to the history manager.

        :param session_id: The session ID for this interaction.
        :param user_input: The user's input string.
        :param response: The agent's response or action plan.
        """
        interaction = {"user_input": user_input, "response": response}
        self.history_manager.save_interaction(
            account_id=self.account_id,
            agent_id=self.id,
            session_id=session_id,
            interaction=interaction,
        )
