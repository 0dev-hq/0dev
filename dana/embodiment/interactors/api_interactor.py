from requests import post

from .base_interactor import BaseInteractor


class APIInteractor(BaseInteractor):

    def interact(self, user_input: str, session_id: str, agent_url: str) -> dict:
        """
        Interact with the agent API to process input and determine actions or perceptions.

        :param user_input: Input string from the user.
        :param session_id: The session ID for this interaction.
        :param agent_url: The URL of the agent API.
        :return: A dictionary representing the agent's response or next step.
        """
        url = f"{agent_url}/interact"
        headers = {"Content-Type": "application/json"}
        payload = {"input": user_input, "session_id": session_id}

        try:
            response = post(
                url,
                json=payload,
                headers=headers,
            )
            return response.json()
        except Exception as e:
            print(f"opps issue error: {str(e)}")
            return {"error": f"ops issue: {str(e)}"}
