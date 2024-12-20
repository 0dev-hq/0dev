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
        if step_type == NextStep.PLAN:
            return self._handle_plan(
                user_input, context, session_id, account_id, agent_id
            )
        elif step_type == NextStep.PERCEPTION:
            return self._handle_perception(
                user_input, context, session_id, account_id, agent_id
            )
        elif step_type == NextStep.CONFIRM_EXECUTION:
            return self._handle_confirmation(
                user_input, context, session_id, account_id, agent_id
            )
        elif step_type == NextStep.EXECUTE:
            return self._handle_execution(
                user_input, context, session_id, account_id, agent_id
            )
        elif step_type == NextStep.NONE:
            return self._handle_none(user_input, session_id, account_id, agent_id)
        elif step_type == NextStep.ANSWER:
            return self._handle_answer(user_input, context, session_id, account_id, agent_id)
        else:
            return self._handle_error(step_type, session_id, account_id, agent_id)

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

        print(f"Generated code: {generated_code}")

        # Save the generated code to the database
        reference_id = self.code_generator.save_code(
            account_id=account_id,
            agent_id=agent_id,
            session_id=session_id,
            generated_code=generated_code,
        )

        # Save the interaction in the history
        self._save_interaction(
            account_id,
            agent_id,
            session_id,
            user_input,
            {
                "type": "action",
                "plan": {
                    "name": generated_code["name"],
                    "code": generated_code["code"],
                    "requirements": generated_code["requirements"],
                    "reference_id": reference_id,
                },
            },
        )

        return {
            "type": "action",
            "plan": {
                "name": generated_code["name"],
                "code": generated_code["code"],
                "requirements": generated_code["requirements"],
                "reference_id": reference_id,
            },
        }

    def _handle_perception(
        self,
        user_input: str,
        context: dict,
        session_id: str,
        account_id: str,
        agent_id: str,
    ) -> dict:
        perception = self.perception_handler.generate_perception(user_input, context)
        self._save_interaction(
            account_id,
            agent_id,
            session_id,
            user_input,
            {"type": "perception", "content": perception},
        )
        return {"type": "perception", "content": perception}

    def _handle_answer(
        self,
        user_input: str,
        context: dict,
        session_id: str,
        account_id: str,
        agent_id: str,
    ) -> dict:
        answer = self.answer_handler.generate_answer(user_input, context)
        self._save_interaction(
            account_id,
            agent_id,
            session_id,
            user_input,
            {"type": "answer", "content": answer},
        )
        return {"type": "answer", "content": answer}
    
    def _handle_confirmation(
        self,
        user_input: str,
        context: dict,
        session_id: str,
        account_id: str,
        agent_id: str,
    ) -> dict:
        confirmation = self.perception_handler.generate_confirmation(user_input, context)
        self._save_interaction(
            account_id,
            agent_id,
            session_id,
            user_input,
            {"type": "confirmation", "content": confirmation},
        )
        return {"type": "confirmation", "content": confirmation}

    def _handle_execution(
        self,
        user_input: str,
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

        self._save_interaction(
            account_id,
            agent_id,
            session_id,
            user_input,
            {
                "type": "execute",
                "status": f"Scheduled job {job_id} for execution for code {reference_id} with inputs {inputs}",
            },
        )
        return {"type": "execution", "content": "Execution started."}

    def _handle_none(
        self, user_input: str, session_id: str, account_id: str, agent_id: str
    ) -> dict:
        message = "I cannot help with that."
        self._save_interaction(
            account_id,
            agent_id,
            session_id,
            user_input,
            {"type": "none", "message": message},
        )
        return {"type": "none", "content": message}

    def _handle_error(
        self, step_type: str, session_id: str, account_id: str, agent_id: str
    ) -> dict:
        error_message = f"Invalid step type determined: {step_type}"
        self._save_interaction(
            account_id,
            agent_id,
            session_id,
            "error",
            {"type": "error", "message": error_message},
        )
        return {"type": "error", "content": error_message}

    def _save_interaction(
        self,
        account_id: str,
        agent_id: str,
        session_id: str,
        user_input: str,
        response: dict,
    ):
        interaction = {"user_input": user_input, "response": response}
        self.history_manager.save_interaction(
            account_id, agent_id, session_id, interaction
        )
