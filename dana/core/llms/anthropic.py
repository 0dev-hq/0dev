import logging
from typing import Optional, Type, TypeVar, Union
from anthropic import Anthropic
from pydantic import BaseModel
from .base_llm import BaseLLM


logger = logging.getLogger(__name__)
T = TypeVar("T", bound=BaseModel)


class AnthropicClient(BaseLLM):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.client = Anthropic(api_key=api_key)
        self.model = model

    def answer(
        self,
        prompt: list[dict],
        formatter: Optional[Type[T]] = None,
    ) -> Union[T, str]:
        """
        Calls the Anthropic API with the provided messages and returns the response.
        If a formatter is provided, includes formatting instructions in the prompt.

        Args:
            prompt: The chat messages to send to the model.
            formatter: Optional Pydantic model to parse the response into.

        Returns:
            Parsed response as the formatter instance or plain string.
        """

        # Convert OpenAI-style messages to Anthropic format
        messages = []
        for msg in prompt:
            role = "assistant" if msg["role"] == "assistant" else "user"
            messages.append({"role": role, "content": msg["content"]})

        if formatter:
            # The tool is used as a workaround to get the structured output from the model
            schema = formatter.model_json_schema()
            tools = [
                {
                    "name": "format_result",
                    "description": (
                        "Format the result in a well-structured JSON that matches the given schema (compatible with pydantic)."
                        "input_schema is generated from a Pydantic class by calling model_json_schema method."
                    ),
                    "input_schema": schema,
                }
            ]

            # TODO: Remove this once the Anthropic API provides a better way to handle structured output
            max_retries = 2
            for i in range(max_retries):
                completion = self.client.messages.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=2000,
                    tools=tools,
                    tool_choice={"type": "tool", "name": "format_result"},
                )
                try:
                    response_text = completion.content[0].input
                    return formatter.model_validate(response_text)
                except Exception as e:
                    logger.error(
                        f"Failed to parse response as {formatter.__name__}: {e}"
                    )
                    logger.error(f"Raw response: {response_text}")
                    if i == max_retries - 1:
                        raise ValueError(
                            f"Failed to parse response as {formatter.__name__}"
                        )

        completion = self.client.messages.create(
            model=self.model,
            messages=messages,
            max_tokens=2000,
        )

        response_text = completion.content[0].text

        return response_text
