from dataclasses import dataclass


@dataclass
class AgentContext:
    """
    A data class to represent the context of an agent.
    """

    history: list[dict]
    intents: list[str]
    facts: list[str]
    policies: list[str]
