from abc import ABC, abstractmethod
from typing import Optional, Type, TypeVar, Union
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)


class BaseLLM(ABC):
    """Base class for Language Model implementations."""

    @abstractmethod
    def answer(
        self,
        prompt: list[dict],
        formatter: Optional[Type[T]] = None,
    ) -> Union[T, str]:
        """
        Process a prompt and return the model's response.

        Args:
            prompt: The chat messages to send to the model.
            formatter: Optional Pydantic model to parse the response into.

        Returns:
            Parsed response as the formatter instance or plain string.
        """
        pass
