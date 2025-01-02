import logging
from typing import Optional, Type, TypeVar, Union
from openai import OpenAI
from pydantic import BaseModel

logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)


class OpenAIClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini-2024-07-18"

    def answer(
        self,
        prompt: list[dict],
        formatter: Optional[Type[T]] = None,
    ) -> Union[T, str]:
        """
        Calls the OpenAI API with the provided messages and returns the response.
        If a formatter is provided, parses the response into the formatter. Otherwise, returns a string.
        :param prompt: The chat messages to send to the model.
        :param formatter: Optional Pydantic model to parse the response into.
        :return: Parsed response as the formatter instance or plain string.
        """
        if formatter:
            completion = self.client.beta.chat.completions.parse(
                model=self.model,
                messages=prompt,
                response_format=formatter,
            )
            return completion.choices[0].message.parsed
        else:
            completion = self.client.chat.completions.create(
                model=self.model,
                messages=prompt,
            )
            return completion.choices[0].message.content

    # def format_response(self, response: str, format: str) -> str:
    #     """
    #     Format the response based on the requested format.
    #     """
    #     if format == "json":
    #         # if it's already in JSON format, return as is otherwise try to parse it
    #         try:
    #             json.loads(response)
    #             logger.info("sending response directly")
    #             return response
    #         except json.JSONDecodeError:
    #             # Response is like ```json <response>``` so we need to extract the response.
    #             return response[7:-3]
    #     elif format == "yaml":
    #         # Response is like ```yaml <response>``` so we need to extract the response.
    #         return response[7:-3]
    #     elif format == "text":
    #         return response
    #     else:
    #         raise ValueError(f"Unsupported format: {format}")
