import logging
from pydantic import BaseModel
from core.agent_context import AgentContext
from core.navigation.next_step import NextStep


logger = logging.getLogger(__name__)


class ReviewFormat(BaseModel):
    is_valid: bool
    hint: str


class NavigationReviewer:
    """
    A reviewer that verifies the decision made by the navigator and ensures correctness before proceeding.
    """

    def __init__(self, llm_client, max_revisions=2):
        """
        Initialize the reviewer with dependencies.

        :param llm_client: An OpenAI client for decision-making and queries.
        :param max_revisions: Maximum number of revisions allowed.
        """
        self.llm_client = llm_client
        self.max_revisions = max_revisions

    def review_navigation_decision(
        self, next_step: NextStep, justification: str, user_input: str, context: dict
    ) -> dict:
        """
        Review the decision made by the navigator to ensure correctness.

        :param next_step: The proposed next step.
        :param justification: The explanation for the decision.
        :param context: The contextual information used in decision-making.
        :return: A dictionary containing the review result.
        """
        review_prompt = self._generate_review_prompt(
            next_step, justification, user_input, context
        )
        review_result = self.llm_client.answer(
            prompt=review_prompt, formatter=ReviewFormat
        )

        logger.info(
            f"Review result: {review_result} (Step: {next_step.value}, Justification: {justification})"
        )

        return {
            "is_valid": review_result.is_valid,
            "hint": review_result.hint if not review_result.is_valid else "",
        }

    def _generate_review_prompt(
        self,
        next_step: NextStep,
        justification: str,
        user_input: str,
        context: AgentContext,
    ) -> str:
        """
        Generate a prompt for the LLM to review the navigation decision.

        :param next_step: The proposed next step.
        :param justification: The explanation for the decision.
        :param context: The contextual information used in decision-making.
        :return: A formatted prompt string for review.
        """

        secrets = {
            secret["name"]: secret["description"]
            for secret in context.get("secrets", [])
        }
        integrations = {
            integration["name"]: {
                "credentials": integration["credentials"],
            }
            for integration in context["integrations"]
        }

        SYSTEM_PROMPT = """You are an expert reviewer responsible for verifying decision-making accuracy of an AI agent.
        You will receive a proposed next step and its justification along with contextual information.
        Your task is to determine whether the selected step is appropriate or if it needs revision."""

        REVIEW_GUIDELINES = """
        - Ensure the next step aligns with the provided context, user request, and history.
        - If there is missing information, suggest a revision.
        - If the justification is weak or unclear, request an adjustment.
        - Confirm that execution steps are only taken when all necessary data is available.
        - If the agent is asking for confirmation, it should have a valid reference ID based on the history of interactions. If a valid reference ID
        is not available one of the reasons could be that the agent is hallucinating and hasn't created a plan for its current goal yet. In this case,
        tell the agent to generate a plan first.
        """

        CONTEXT = f"""Context:
        Facts: {context.get('facts', 'No facts available')}
        Agent's allowed intents: {context.get('intents', 'No intents available')}
        Agent's policies: {context.get('policies', 'No policies available')}
        Secrets shared with the agent: {secrets if secrets else 'No secrets available'}
        Integrations shared with the agent: {integrations if integrations else 'No integrations available'}
        History of interactions: {context.get('history', 'No history available')}.
        User's latest input: {user_input}."""

        RESPONSE_FORMAT = """
        Provide a JSON response with:
        - 'is_valid': Whether the next step is valid.
        - 'hint': A suggestion for improvement if revision is needed. This will be provided as a hint to the navigator.
        """

        prompt = [
            {
                "role": "system",
                "content": f"{SYSTEM_PROMPT}\n{REVIEW_GUIDELINES}\n{CONTEXT}\n{RESPONSE_FORMAT}",
            },
            {
                "role": "user",
                "content": f"Review the next step '{next_step.value}' with justification: {justification}. Is this the correct choice?",
            },
        ]

        return prompt
