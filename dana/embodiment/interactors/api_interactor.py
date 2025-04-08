from requests import post, get, exceptions

from .base_interactor import BaseInteractor


class APIInteractor(BaseInteractor):

    def interact(
        self, user_input: str, session_id: str, agent_deployment_metadata: dict
    ) -> dict:
        """
        Interact with the agent API to process input and determine actions or perceptions.

        :param user_input: Input string from the user.
        :param session_id: The session ID for this interaction.
        :param agent_deployment_metadata: Metadata containing information about the deployed agent, such as its URL.
        :return: A dictionary representing the agent's response or next step.
        """
        agent_url = agent_deployment_metadata["url"]
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
        except exceptions.RequestException as e:
            print(f"Error interacting with agent: {str(e)}")
            return {"error": f"Error interacting with agent: {str(e)}"}
