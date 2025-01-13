import os
import openai
import yaml
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker



class ActionSensorRegistry:
    """
    A registry for managing actions and sensors with embeddings.
    Supports RAG-based retrieval and similarity search.
    """

    def __init__(self):
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

    def generate_embeddings(self, text_chunk):
        """Generate embeddings using OpenAI."""
        client = openai.OpenAI()
        response = client.embeddings.create(
            input=text_chunk,
            model="text-embedding-ada-002"  # Updated to the latest embedding model
        )
        return response.data[0].embedding

    def load(self, actions_file: str, sensors_file: str):
        """
        Load actions and sensors from YAML files and populate the database.
        
        :param actions_file: Path to the YAML file containing actions.
        :param sensors_file: Path to the YAML file containing sensors.
        """
        with open(actions_file, "r") as af:
            actions = yaml.safe_load(af)
        with open(sensors_file, "r") as sf:
            sensors = yaml.safe_load(sf)

        with self.Session() as session:
            for item in actions + sensors:
                name = item["name"]
                description = item["description"]
                item_type = "action" if item in actions else "sensor"
                
                # Check if the item already exists
                exists = session.execute(
                    text("SELECT 1 FROM action_sensor_registry WHERE name = :name AND type = :type"),
                    {"name": name, "type": item_type}
                ).fetchone()

                if not exists:
                    # Generate embeddings
                    embedding = self.generate_embeddings(description)

                    # Insert the item into the database
                    session.execute(
                        text("""
                            INSERT INTO action_sensor_registry (name, type, description, tags, inputs, outputs, embedding)
                            VALUES (:name, :type, :description, :tags, :inputs, :outputs, :embedding)
                        """),
                        {
                            "name": name,
                            "type": item_type,
                            "description": description,
                            "tags": item["tags"],
                            "inputs": item["inputs"],
                            "outputs": item["outputs"],
                            "embedding": embedding
                        }
                    )
                    session.commit()
                    print(f"Loaded new {item_type}: {name}")
        print("All items loaded successfully.")

    def list_actions(self, description: str, top_k: int = 5) -> list:
        """
        List actions using similarity search on embeddings.
        
        :param description: A textual description of the desired action.
        :param top_k: Number of top results to return.
        :return: A list of action names sorted by similarity.
        """
        embedding = self.generate_embeddings(description)

        with self.Session() as session:
            result = session.execute(
                text("""
                    SELECT name, description, 1 - (embedding <-> CAST(:embedding AS vector)) AS similarity
                    FROM action_sensor_registry
                    WHERE type = 'action'
                    ORDER BY similarity DESC
                    LIMIT :top_k
                """),
                {"embedding": embedding, "top_k": top_k}
            ).fetchall()

        return [
            {"name": row[0], "description": row[1], "similarity": row[2]} for row in result
        ]

    def list_sensors(self, description: str, top_k: int = 5) -> list:
        """
        List sensors using similarity search on embeddings.
        
        :param description: A textual description of the desired sensor.
        :param top_k: Number of top results to return.
        :return: A list of sensor names sorted by similarity.
        """
        embedding = self.generate_embeddings(description)

        with self.Session() as session:
            result = session.execute(
                text("""
                    SELECT name, description, 1 - (embedding <-> CAST(:embedding AS vector)) AS similarity
                    FROM action_sensor_registry
                    WHERE type = 'action'
                    ORDER BY similarity DESC
                    LIMIT :top_k
                """),
                {"embedding": embedding, "top_k": top_k}
            ).fetchall()
        return [
            {"name": row[0], "description": row[1], "similarity": row[2]} for row in result
        ]
    
    def get_action_details(self, names: list) -> list:
        """
        Retrieve detailed information for a list of action names.
        
        :param names: A list of action names.
        :return: A list of dictionaries with action details.
        """
        with self.Session() as session:
            result = session.execute(
                text("""
                    SELECT name, description, tags, inputs, outputs
                    FROM action_sensor_registry
                    WHERE name = ANY(:names) AND type = 'action'
                """),
                {"names": names}
            ).fetchall()
        return [
            {"name": row[0], "description": row[1], "tags": row[2], "inputs": row[3], "outputs": row[4]}
            for row in result
        ]

    def get_sensor_details(self, names: list) -> list:
        """
        Retrieve detailed information for a list of sensor names.
        
        :param names: A list of sensor names.
        :return: A list of dictionaries with sensor details.
        """
        with self.Session() as session:
            result = session.execute(
                text("""
                    SELECT name, description, tags, inputs, outputs
                    FROM action_sensor_registry
                    WHERE name = ANY(:names) AND type = 'sensor'
                """),
                {"names": names}
            ).fetchall()
        return [
            {"name": row[0], "description": row[1], "tags": row[2], "inputs": row[3], "outputs": row[4]}
            for row in result
        ]