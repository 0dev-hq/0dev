import json
from core.agent_context import AgentContext
from core.answer_handler import AnswerHandler
from core.base_code_executor import BaseCodeExecutor
from core.base_code_generator import BaseCodeGenerator
from core.base_history_manager import BaseHistoryManager
from core.navigator import NextStep
from core.perception_handler import PerceptionHandler


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
        self.interactions = []  # Collect interactions during the session

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
                    user_input, context, session_id, account_id, agent_id
                )
            elif step_type == NextStep.NONE:
                response = self._handle_none()
            elif step_type == NextStep.ANSWER:
                response = self._handle_answer(
                    user_input,
                    context,
                )
            else:
                response = self._handle_error(
                    step_type, session_id, account_id, agent_id
                )
        except Exception as e:
            response = self._handle_error(str(e))
        finally:
            self._save_interaction(user_input, response)
            return response

    def finalize_interactions(self, account_id: str, agent_id: str, session_id: str):
        """
        Save all collected interactions at once.
        """
        self.history_manager.save_interaction(
            account_id, agent_id, session_id, self.interactions
        )
        self.interactions = []  # Reset interactions after saving

    def _handle_plan(
        self,
        user_input: str,
        context: AgentContext,
        session_id: str,
        account_id: str,
        agent_id: str,
    ) -> dict:
        # Generate code using the code generator
        generated_code = self.code_generator.generate(user_input, context)
        reference_id = self.code_generator.save_code(
            account_id=account_id,
            agent_id=agent_id,
            session_id=session_id,
            generated_code=generated_code,
        )

        return {
            "type": "action",
            "plan": {
                "name": generated_code.name,
                "code": generated_code.code,
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
        return {"type": "confirmation", "content": confirmation}

    def _handle_execution(
        self,
        context: AgentContext,
        session_id: str,
        account_id: str,
        agent_id: str,
    ) -> dict:
        (generated_code, inputs, reference_id) = (
            self.code_generator.get_code_with_input(
                account_id, agent_id, session_id, context
            )
        )
        (job_id, secret) = self.code_executor.create_job(
            account_id=account_id, agent_id=agent_id, session_id=session_id
        )
        self.code_executor.execute_job(
            job_id=job_id,
            secret=secret,
            code=generated_code.code,
            requirements=generated_code.requirements,
            inputs=inputs,
        )
        return {
            "type": "execution",
            "content": f"Scheduled job {job_id} for execution for code {reference_id} with inputs {inputs}",
        }

    def _handle_none(
        self,
    ) -> dict:
        message = "I cannot help with that."
        return {"type": "none", "content": message}

    def _handle_error(
        self,
        step_type: str,
    ) -> dict:
        error_message = f"Invalid step type determined: {step_type}"
        return {"type": "error", "content": error_message}

    def _save_interaction(
        self,
        user_input: str,
        response: dict,
    ):
        # todo: only save the response, user_input should be saved separately
        interaction = {"user_input": user_input, "response": response}
        self.interactions.append(interaction)
