from api.models.interaction_history import InteractionHistory
from api.db import db
import logging
logger = logging.getLogger(__name__)


class InteractionHistoryService:

    def save_interaction(
        self,
        account_id: str,
        agent_id: str,
        session_id: str,
        interaction: dict,
        summary: str,
    ):
        """
        Save a new interaction and update the moving summary.

        :param account_id: The ID of the account the agent belongs to.
        :param agent_id: The id of the agent.
        :param session_id: The session ID this interaction belongs to.
        :param interaction: A dictionary representing the interaction details.
        :param summary: The updated summary.
        """
        try:
            interaction_history = InteractionHistory(
                account_id=account_id,
                agent_id=agent_id,
                session_id=session_id,
                interaction=interaction,
                summary=summary,
            )
            db.session.add(interaction_history)
            db.session.commit()
        except Exception as e:
            logger.error(f"Error saving interaction: {e}")
            db.session.rollback()
            raise e

    def get_history(
        self, account_id: str, agent_id: str, session_id: str, n: int = 10
    ) -> list:
        """
        Retrieve the last 'n' interactions for a given session.

        :param account_id: The ID of the account to filter by.
        :param agent_id: The id of the agent to filter by.
        :param session_id: The session ID to filter by.
        :param n: The number of recent interactions to return.
        :return: A list of interactions sorted by timestamp in descending order.
        """
        try:
            interactions = InteractionHistory.query.filter_by(
                account_id=account_id, agent_id=agent_id, session_id=session_id
            ).order_by(InteractionHistory.timestamp.desc()).limit(n).all()

            logger.info(f"Interactions: {interactions}")
            
            return [interaction.to_dict() for interaction in interactions]
        except Exception as e:
            logger.error(f"Error getting history: {e}")
            raise e

    def get_summary(self, account_id: str, agent_id: str, session_id: str) -> str:
        """
        Retrieve the latest moving summary for the session.

        :param account_id: The ID of the account.
        :param agent_id: The id of the agent.
        :param session_id: The session ID to filter by.
        :return: The latest summary as a string.
        """
        try:
            interaction = InteractionHistory.query.filter_by(
                account_id=account_id, agent_id=agent_id, session_id=session_id
            ).order_by(InteractionHistory.timestamp.desc()).first()
            if interaction:
                return interaction.summary
            else:
                return ""
        except Exception as e:
            logger.error(f"Error getting summary: {e}")
            raise e

