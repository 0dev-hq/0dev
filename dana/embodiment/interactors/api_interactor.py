from requests import post, get, exceptions

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
            response.raise_for_status()
            return response.json()
        except exceptions.RequestException as e:
            print(f"Error interacting with agent: {str(e)}")
            return {"error": f"Error interacting with agent: {str(e)}"}

    def get_history(self, session_id: str, agent_url: str) -> dict:
        """
        Retrieve interaction history for a session.

        :param session_id: Session ID to filter by.
        :param agent_url: The URL of the agent to interact with.
        :return: A dictionary representing the interaction history.
        """
        url = f"{agent_url}/history"

        try:
            response = get(url, params={"session_id": session_id})
            response.raise_for_status()
            return response.json()
        except exceptions.RequestException as e:
            print(f"Error retrieving history: {str(e)}")
            return {"error": f"Error retrieving history: {str(e)}"}
