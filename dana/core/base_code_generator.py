from abc import ABC, abstractmethod
from dataclasses import dataclass
import uuid
from typing import Any
from sqlalchemy import (
    create_engine,
    text,
    Column,
    Integer,
    String,
    DateTime,
    JSON,
    Table,
    MetaData,
)
from sqlalchemy.orm import sessionmaker
from core.agent_context import AgentContext
import os


@dataclass
class GeneratedCode:
    name: str
    description: str
    code: str
    requirements: str


@dataclass
class GeneratedCodeWithInput:
    generated_code: GeneratedCode
    inputs: dict
    reference_id: str


class BaseCodeGenerator(ABC):
    def __init__(self, llm_client):
        """
        Initialize the base code generator.
        :param llm_client: LLM client instance for generating code.
        """
        self.llm_client = llm_client
        self.engine = self._create_db_engine()
        self.Session = sessionmaker(bind=self.engine)

    def _create_db_engine(self):
        """Create a PostgreSQL engine using environment variables."""
        db_user = os.getenv("INTERNAL_DB_USER")
        db_pass = os.getenv("INTERNAL_DB_PASS")
        db_host = os.getenv("INTERNAL_DB_HOST")
        db_port = os.getenv("INTERNAL_DB_PORT")
        db_name = os.getenv("INTERNAL_DB_NAME")
        return create_engine(f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}")

    @abstractmethod
    def generate(self, user_input: str, context: AgentContext) -> GeneratedCode:
        """
        Generate code based on the given task and context.
        :param user_input: The user's latest input.
        :param context: The current agent context.
        :return: An instance of GeneratedCode.
        """
        pass

    def save_code(
        self,
        account_id: str,
        agent_id: str,
        session_id: str,
        generated_code: GeneratedCode,
    ) -> str:
        """
        Save the generated code into the database.
        :param account_id: Account ID associated with the agent.
        :param agent_id: Agent ID that generated the code.
        :param session_id: Session ID during which the code was generated.
        :param name: Name of the generated code.
        :param description: Description of the task.
        :param generated_code: The generated code and its requirements.
        :return: The reference ID of the saved code.
        """

        reference_id = str(uuid.uuid4())

        try:

            with self.Session() as session:
                session.execute(
                    text(
                        """
                        INSERT INTO agent_generated_codes (
                            reference_id, account_id, agent_id, session_id,
                            name, description, code, requirements, created_at
                        )
                        VALUES (:reference_id, :account_id, :agent_id, :session_id, :name, :description, :code, :requirements, NOW())
                        """
                    ),
                    {
                        "reference_id": reference_id,
                        "account_id": account_id,
                        "agent_id": agent_id,
                        "session_id": session_id,
                        "name": generated_code["name"],
                        "description": generated_code["description"],
                        "code": generated_code["code"],
                        "requirements": generated_code["requirements"],
                    },
                )
                session.commit()

            return reference_id

        except Exception as e:
            print(f"Error saving generated code: {e}")
            return ""

    def get_code_with_input(
        self, account_id: str, agent_id: str, session_id: str, context: AgentContext
    ) -> GeneratedCodeWithInput:
        """
        Retrieve the generated code from the database.
        The reference_id and version are inferred using the LLM from the provided context.
        If no version is specified, the latest version is fetched.

        :param account_id: Account ID associated with the agent.
        :param agent_id: Agent ID that generated the code.
        :param session_id: Session ID during which the code was generated.
        :param context: The current agent context containing history and facts.
        :return: Generated code with inputs and reference_id if found, None otherwise.
        """
        try:
            # Use LLM client to infer reference_id and version
            response = self.llm_client.answer(
                prompt=self._build_inference_prompt(context), format="json"
            )

            reference_id = response.get("reference_id")
            version = response.get(
                "version", "latest"
            )  # Default to 'latest' if version not specified

            # Validate reference_id
            if not reference_id:
                raise ValueError(
                    "The LLM response did not provide a valid 'reference_id'."
                )

            # Query to fetch the specific version or the latest
            query = """
                SELECT name, description, code, requirements
                FROM agent_generated_codes
                WHERE account_id = %s AND agent_id = %s AND session_id = %s AND reference_id = %s
            """
            params = [account_id, agent_id, session_id, reference_id]

            if version == "latest":
                query += " ORDER BY version DESC LIMIT 1"
            else:
                query += " AND version = %s"
                params.append(version)

            with self.Session() as session:
                result = session.execute(text(query), params).fetchone()

            if result:
                name, description, code, requirements = result
                return GeneratedCodeWithInput(
                    generated_code=GeneratedCode(name, description, code, requirements),
                    inputs=response.get("inputs", {}),
                    reference_id=reference_id,
                )

        except Exception as e:
            print(f"Error retrieving generated code: {e}")
        return None

    def _build_inference_prompt(self, context: AgentContext) -> list[dict]:
        """
        Create a prompt for the LLM to infer the reference_id and version from the context.

        :param context: The current agent context.
        :return: A formatted prompt as a list of messages for the LLM.
        """
        return [
            {
                "role": "system",
                "content": """
                You are the brain of an intelligent assistant agent that should identify which code to execute and with which inputs.
                If no version is explicitly specified to be executed as the latest context, set it to 'latest'.
                """,
            },
            {
                "role": "user",
                "content": f"""
                    Given the following context:
                    History: {context.history}
                    Facts: {context.facts}
                    Please determine:
                    1. The reference_id of the relevant code.
                    2. The version of the code (set to 'latest' if not specified).
                    3. The inputs required for the code execution with format that matches the code requirements. 
                    Use only the available facts and history. Don't make up any fictional values.
                    Output as a JSON object with keys 'reference_id', 'version', 'inputs'.
                    """,
            },
        ]

    def update_code(
        self,
        account_id: str,
        agent_id: str,
        session_id: str,
        reference_id: str,
        generated_code: GeneratedCode,
    ) -> bool:
        """
        Add a new version of the generated code to the database.
        :param account_id: Account ID associated with the agent.
        :param agent_id: Agent ID that generated the code.
        :param session_id: Session ID during which the code was generated.
        :param reference_id: Reference ID of the code to update.
        :param generated_code: The updated generated code and its requirements.
        :return: True if the code was successfully updated, False otherwise.
        """
        try:
            with self.Session() as session:
                session.execute(
                    text(
                        """
                        INSERT INTO agent_generated_codes (
                            reference_id, account_id, agent_id, session_id,
                            name, description, code, requirements, created_at
                        )
                        VALUES (:reference_id, :account_id, :agent_id, :session_id, :name, :description, :code, :requirements, NOW())
                        """
                    ),
                    {
                        "reference_id": reference_id,
                        "account_id": account_id,
                        "agent_id": agent_id,
                        "session_id": session_id,
                        "name": generated_code.name,
                        "description": generated_code.description,
                        "code": generated_code.code,
                        "requirements": generated_code.requirements,
                    },
                )
                session.commit()
                return True
        except Exception as e:
            print(f"Error updating generated code: {e}")
            return False
