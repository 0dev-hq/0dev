import time
import jwt
from api.config import Config


class TokenService:
    """
    Service class for generating JWT tokens for agents. This token is valid for the Node API too.
    """

    @staticmethod
    def generate_token(account_id, agent_id: str) -> str:
        """
        Generate a JWT token for the specified agent.

        :param account_id: The account ID of the agent.
        :param agent_id: The ID of the agent.
        """
        payload = {
            "account": account_id,
            "agent_id": agent_id,
            "type": "agent",
            "exp": time.time() + Config.JWT_EXPIRY,
        }
        return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")
