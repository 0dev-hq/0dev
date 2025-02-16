import logging
import traceback
from core.agent_context import AgentContext
from core.info.answer_handler import AnswerHandler
from core.execution.base_code_executor import BaseCodeExecutor
from core.code_generation.base_code_generator import BaseCodeGenerator
from core.history_management.base_history_manager import BaseHistoryManager
from core.navigation.navigator import NextStep
from core.perception.perception_handler import PerceptionHandler

logger = logging.getLogger(__name__)


class StepHandler:
    """
    Handles the next step based on the Navigator's decision.
    Encapsulates the logic for dealing with actions, perceptions, or other next steps.
    """

    def __init__(
        self,
        code_generator: BaseCodeGenerator,
        history_manager: BaseHistoryManager,
        perception_handler: PerceptionHandler,
        code_executor: BaseCodeExecutor,
        answer_handler: AnswerHandler,
    ):
        """
        Initialize the StepHandler with dependencies.

        :param code_generator: Instance of CodeGenerator for generating code.
        :param history_manager: Instance of HistoryManager for managing interaction history.
        :param perception_handler: Instance of PerceptionHandler for generating perceptions.
        :param answer_handler: Instance of AnswerHandler for generating answers.
        :param code_executor: Instance of CodeExecutor for executing generated code.
        """
        self.code_generator = code_generator
        self.history_manager = history_manager
        self.perception_handler = perception_handler
        self.answer_handler = answer_handler
        self.code_executor = code_executor

    def handle_step(
        self,
        step_type: str,
        user_input: str,
        context: AgentContext,
        session_id: str,
        account_id: str,
        agent_id: str,
    ) -> dict:
        """
        Handle the next step as determined by the Navigator.

        :param step_type: The next step type (e.g., "plan", "perception", "execute", "none").
        :param user_input: The user's input string.
        :param context: The current context of the interaction.
        :param session_id: The session ID for the interaction.
        :param account_id: The account ID associated with the agent.
        :param agent_id: The ID of the agent handling the interaction.
        :return: A dictionary representing the result of handling the step.
        """
        try:

            if step_type == NextStep.PLAN:
                response = self._handle_plan(
                    user_input, context, session_id, account_id, agent_id
                )
            elif step_type == NextStep.Question:
                response = self._handle_question(
                    user_input,
                    context,
                )
            elif step_type == NextStep.Option:
                response = self._handle_option(
                    user_input,
                    context,
                )
            elif step_type == NextStep.CONFIRM_EXECUTION:
                response = self._handle_confirmation(
                    user_input,
                    context,
                )
            elif step_type == NextStep.EXECUTE:
                response = self._handle_execution(
                    context, session_id, account_id, agent_id
                )
            elif step_type == NextStep.NONE:
                response = self._handle_none()
            elif step_type == NextStep.ANSWER:
                response = self._handle_answer(
                    user_input,
                    context,
                )
            else:
                logger.error(f"Invalid step type: {step_type}")
                response = self._handle_error(f"Invalid step type: {step_type}")
        except Exception as e:
            logger.error(f"Error handling step: {traceback.format_exc()}")
            response = self._handle_error(str(e))
        finally:
            return response

    def _handle_plan(
        self,
        user_input: str,
        context: AgentContext,
        session_id: str,
        account_id: str,
        agent_id: str,
    ) -> dict:

        generated_code = self.code_generator.generate(user_input, context)
        logger.info(f"Generated code: {generated_code}")
        reference_id = self.code_generator.save_code(
            account_id=account_id,
            agent_id=agent_id,
            session_id=session_id,
            generated_code=generated_code,
        )

        return {
            "type": "plan",
            "content": {
                "name": generated_code.name,
                "code": generated_code.code,
                "description": generated_code.description,
                "requirements": generated_code.requirements,
                "reference_id": reference_id,
            },
        }

    def _handle_question(
        self,
        user_input: str,
        context: dict,
    ) -> dict:
        question = self.perception_handler.generate_question(user_input, context)
        return {"type": "question", "content": question}

    def _handle_option(
        self,
        user_input: str,
        context: dict,
    ) -> dict:
        options = self.perception_handler.generate_options(user_input, context)
        return {"type": "options", "content": options}

    def _handle_answer(
        self,
        user_input: str,
        context: dict,
    ) -> dict:
        answer = self.answer_handler.generate_answer(user_input, context)
        return {"type": "answer", "content": answer}

    def _handle_confirmation(
        self,
        user_input: str,
        context: dict,
    ) -> dict:
        confirmation = self.perception_handler.generate_confirmation(
            user_input, context
        )
        return {"type": "confirmation", "content": confirmation.model_dump()}

    def _handle_execution(
        self,
        context: AgentContext,
        session_id: str,
        account_id: str,
        agent_id: str,
    ) -> dict:
        logger.debug("Handling execution step")
        executionContext = self.code_generator.get_code_with_input(
            account_id, agent_id, session_id, context
        )

        logger.debug(f"Executing code: {executionContext.generated_code.code}")
        logger.debug(f"Inputs: {executionContext.inputs}")
        logger.debug(f"Reference ID: {executionContext.reference_id}")

        # filter the secrets to only include the ones that are required by the code
        secrets = {
            secret["name"]: secret["value"]
            for secret in context["secrets"]
            if secret["name"] in executionContext.generated_code.secrets
        }

        # filter the integrations to only include the ones that are required by the code
        integrations = {
            integration["name"]: {
                "credentials": integration["credentials"],
            }
            for integration in context["integrations"]
            if integration["name"] in executionContext.generated_code.integrations
        }

        job_id = self.code_executor.execute_code(
            account_id=account_id,
            agent_id=agent_id,
            session_id=session_id,
            code=executionContext.generated_code.code,
            requirements=executionContext.generated_code.requirements,
            inputs=executionContext.inputs,
            secrets=secrets,
            integrations=integrations,
            name=executionContext.generated_code.name,
            description=executionContext.generated_code.description,
        )
        logger.info(f"Scheduled job: {job_id}")
        return {
            "type": "execution",
            "content": f"Scheduled job {job_id} for execution for code {executionContext.reference_id} with inputs {executionContext.inputs}",
        }

    def _handle_none(
        self,
    ) -> dict:
        message = "I cannot help with that."
        return {"type": "none", "content": message}

    def _handle_error(
        self,
        error_message: str,
    ) -> dict:
        return {"type": "error", "content": error_message}
