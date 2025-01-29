from abc import ABC, abstractmethod
import uuid
from pydantic import BaseModel
from sqlalchemy import (
    create_engine,
    text,
)
from sqlalchemy.orm import sessionmaker
from core.agent_context import AgentContext
import os
import logging

from core.perception_handler import InputItemFormat


logger = logging.getLogger(__name__)


class GeneratedCodeFormat(BaseModel):
    name: str
    description: str
    code: str
    requirements: list[str]
    secrets: list[str]
    integrations: list[str]


class GeneratedCodeWithInput(BaseModel):
    generated_code: GeneratedCodeFormat
    inputs: list[InputItemFormat]
    reference_id: str


class AgentGeneratedCodeFormat(BaseModel):
    reference_id: str
    version: str
    inputs: list[InputItemFormat]


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
        return create_engine(
            f"postgresql+psycopg2://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"
        )

    @abstractmethod
    def generate(self, user_input: str, context: AgentContext) -> GeneratedCodeFormat:
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
        generated_code: GeneratedCodeFormat,
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
                            name, description, code, requirements, secrets, integrations, created_at
                        )
                        VALUES (:reference_id, :account_id, :agent_id, :session_id, :name, :description, :code, :requirements, :secrets,
                        :integrations, NOW())
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
                        "requirements": ",".join(generated_code.requirements) if generated_code.requirements else "",
                        "secrets": ",".join(generated_code.secrets) if generated_code.secrets else "",
                        "integrations": ",".join(generated_code.integrations) if generated_code.integrations else "",
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
        This code first identifies (reference_id and version) which code to execute and with which inputs, secrets and integrations based on the context.
        Then uses the reference_id and version to fetch the code from the database.
        If no version is specified, the latest version is fetched.
        Note: Unlike the inputs, for secrets and integrations, we return only the names without the values in this function.

        :param account_id: Account ID associated with the agent.
        :param agent_id: Agent ID that generated the code.
        :param session_id: Session ID during which the code was generated.
        :param context: The current agent context containing history and facts.
        :return: Generated code with inputs and reference_id if found, None otherwise.
        """
        try:

            logger.info("inside get_code_with_input")

            # Use LLM client to infer reference_id and version
            response = self.llm_client.answer(
                prompt=self._find_reference_id_version_prompt(context),
                formatter=AgentGeneratedCodeFormat,
            )

            logger.info(f"LLM response: {response}")

            reference_id = response.reference_id
            # default to 'latest' if not specified
            version = response.version or "latest"

            # Validate reference_id
            if not reference_id:
                raise ValueError(
                    "The LLM response did not provide a valid 'reference_id'."
                )

            # Query to fetch the specific version or the latest
            # todo: include version in the query
            query = """
                SELECT name, description, code, requirements, secrets, integrations
                FROM agent_generated_codes
                WHERE account_id = :account_id AND agent_id = :agent_id AND session_id = :session_id AND reference_id = :reference_id
            """
            params = {
                "account_id": account_id,
                "agent_id": agent_id,
                "session_id": session_id,
                "reference_id": reference_id,
            }

            if version != "latest":
                query += " AND version = :version"
                params["version"] = version
            else:
                query += " ORDER BY version DESC LIMIT 1"

            with self.Session() as session:
                result = session.execute(text(query), params).fetchone()

            if result:
                name, description, code, requirements, secrets, integrations = result
                return GeneratedCodeWithInput(
                    generated_code=GeneratedCodeFormat(
                        name=name,
                        description=description,
                        code=code,
                        requirements=requirements.split(",") if requirements else [],
                        secrets=secrets.split(",") if secrets else [],
                        integrations=integrations.split(",") if integrations else [],
                    ),
                    inputs=response.inputs or [],
                    reference_id=reference_id,
                )

        except Exception as e:
            print(f"Error retrieving generated code: {e}")
            # throw exception to be caught by the caller
            raise e

    def _find_reference_id_version_prompt(self, context: AgentContext) -> list[dict]:
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
                    History of interactions with the user: {context.get('history', 'No history available')}
                    Please determine:
                    1. The reference_id of the relevant code.
                    2. The version of the code (set to 'latest' if not specified).
                    3. The inputs required for the code execution with format that matches the code requirements. Exclude the secrets and 
                    integrations as they are passed separately.
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
        generated_code: GeneratedCodeFormat,
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
                            name, description, code, requirements, secrets, integrations, created_at
                        )
                        VALUES (:reference_id, :account_id, :agent_id, :session_id, :name, :description, :code, :requirements, :secrets,
                         :integrations, NOW())
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
                        "requirements": ",".join(generated_code.requirements) if generated_code.requirements else "",
                        "secrets": ",".join(generated_code.secrets) if generated_code.secrets else "",
                        "integrations": ",".join(generated_code.integrations) if generated_code.integrations else "",
                        # todo: add version
                    },
                )
                session.commit()
                return True
        except Exception as e:
            print(f"Error updating generated code: {e}")
            return False
