import logging
from core.base_agent import BaseAgent
from core.navigator import Navigator
from core.base_history_manager import BaseHistoryManager
from core.step_handler import StepHandler

logger = logging.getLogger(__name__)


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
        secrets: list[dict],
        integrations: list[dict],
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
        :param secrets: List of secrets associated with the agent. Each secret is a dict with keys: name, description, and value.
        :param integrations: List of integrations associated with the agent. Each integration is a dict with keys: name, and credentials.
        Credentials is a dict with keys: type which can be "oauth" or "custom", and values. 
        If the credentials type is "oauth", values is a dict with the keys access_token, refresh_token, and expires_at.
        If the credentials type is "custom", values is a list of dicts with keys: name, type (password or text), and value.
        :param account_id: Account ID associated with the agent.
        """
        super().__init__(id, name, description, agent_type="Interactive")
        self.policies = policies
        self.facts = facts
        self.intents = intents
        self.secrets = secrets
        self.integrations = integrations
        self.account_id = account_id
        self.navigator = navigator
        self.step_handler = step_handler
        self.history_manager = history_manager

    def get_identity(self) -> str:
        """
        Return the identity of the agent.
        """
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "account_id": self.account_id,
        }

    def interact(self, user_input: str, session_id: str):
        """
        Engage with the user to process input and determine actions or perceptions.

        :param user_input: Input string from the user.
        :param session_id: The session ID for this interaction.
        :return: A dictionary representing the agent's response or next step.
        """

        self._save_user_input(session_id, user_input)

        context = self._get_context(session_id)
        logger.info(f"Context: {context}")

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

        self._save_response(session_id, response)

        return response

    def _get_context(self, session_id: str) -> dict:
        """
        Get the current context of the agent, including history and configurations.

        :param session_id: The session ID for this interaction.
        :return: A dictionary representing the current context.
        """
        history = self.history_manager.get_history(
            account_id=self.account_id, agent_id=self.id, session_id=session_id
        )
        return {
            "history": history,
            "intents": self.intents,
            "facts": self.facts,
            "policies": self.policies,
            "secrets": self.secrets,
            "integrations": self.integrations,
        }

    def _save_response(self, session_id: str, response: str):
        """
        Save the agent's response to the interaction history.

        :param session_id: The session ID for this interaction.
        :param response: The agent's response string.
        """
        self.history_manager.save_interaction(
            account_id=self.account_id,
            agent_id=self.id,
            session_id=session_id,
            interaction=response,
        )

    def _save_user_input(self, session_id: str, user_input: str):
        """
        Save the user's input to the interaction history.

        :param session_id: The session ID for this interaction.
        :param user_input: The user's input string.
        """
        interaction = {"type": "user_input", "content": user_input}
        self.history_manager.save_interaction(
            account_id=self.account_id,
            agent_id=self.id,
            session_id=session_id,
            interaction=interaction,
        )

    def get_history(self, session_id: str):
        """
        Retrieve the interaction history for a given session.

        :param session_id: The session ID to filter by.
        :return: A list of interactions sorted by timestamp in descending order.
        """
        return self.history_manager.get_history(
            account_id=self.account_id, agent_id=self.id, session_id=session_id
        )
