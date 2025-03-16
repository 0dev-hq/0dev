from typing import Optional
from .base_llm import BaseLLM
from .openai import OpenAIClient
from .anthropic import AnthropicClient


class LLMFactory:
    """Factory class for creating LLM instances."""

    @staticmethod
    def create(
        provider: str,
        api_key: str,
        model: Optional[str] = None,
    ) -> BaseLLM:
        """
        Create an LLM instance based on the specified provider.

        Args:
            provider: The LLM provider (e.g., 'openai')
            api_key: API key for the provider
            model: Optional model identifier

        Returns:
            An instance of BaseLLM

        Raises:
            ValueError: If the provider is not supported
        """
        if provider.lower() == "openai":
            if model:
                return OpenAIClient(api_key=api_key, model=model)
            return OpenAIClient(api_key=api_key)
        elif provider.lower() == "anthropic":
            if model:
                return AnthropicClient(api_key=api_key, model=model)
            return AnthropicClient(api_key=api_key)

        raise ValueError(f"Unsupported LLM provider: {provider}")
