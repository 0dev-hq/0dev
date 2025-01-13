import os
import sys
import json
import subprocess
import socket
from typing import Dict
from api.services.deployments.base_deployment import BaseDeployment


class LocalAPIDeployment(BaseDeployment):
    """
    Deployment strategy for running the agent as a local API.
    """

    def _find_free_port(self) -> int:
        """
        Find an available high-numbered port dynamically.
        :return: An available port number.
        """
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(("", 0))
            return s.getsockname()[1]

    def package(self, agent_id: str, agent_details: Dict) -> str:
        """
        Package the agent details into a configuration file.
        :param agent_id: Unique identifier for the agent.
        :param agent_details: Dictionary containing agent configurations.
        :return: Path to the packaged configuration file.
        """
        agent_path = f"./agents/{agent_id}"
        os.makedirs(agent_path, exist_ok=True)

        config_file = os.path.join(agent_path, "config.json")
        with open(config_file, "w") as f:
            json.dump(agent_details, f, indent=4)

        print(f"Packaged agent configuration at: {config_file}")
        return agent_path

    def deploy(self, package_path: str) -> Dict:
        """
        Deploy the packaged agent as a local API and return the deployment metadata.
        :param package_path: Path to the packaged agent.
        :return: Dictionary containing deployment metadata.
        """
        # Step 1: Find a free port dynamically
        port = self._find_free_port()

        # Step 2: Build the environment variables
        env = {}  # os.environ.copy()
        env.update(
            {
                "INTERNAL_DB_USER": os.getenv("AGENT_INTERNAL_DB_USER"),
                "INTERNAL_DB_PASS": os.getenv("AGENT_INTERNAL_DB_PASS"),
                "INTERNAL_DB_HOST": os.getenv("AGENT_INTERNAL_DB_HOST"),
                "INTERNAL_DB_PORT": os.getenv("AGENT_INTERNAL_DB_PORT"),
                "INTERNAL_DB_NAME": os.getenv("AGENT_INTERNAL_DB_NAME"),
                "OPENAI_API_KEY": os.getenv("OPENAI_API_KEY"),
                "AGENT_CONFIG_PATH": os.path.join(package_path, "config.json"),
                "FLASK_RUN_PORT": str(port),
            }
        )

        venv_path = os.getenv("VIRTUAL_ENV") or os.path.dirname(sys.executable)
        env["PATH"] = f"{venv_path}/bin:" + os.getenv("PATH")
        env["VIRTUAL_ENV"] = venv_path

        # Step 3: Run the agent in a subprocess
        agent_id = os.path.basename(package_path)
        try:
            process = subprocess.Popen(
                [sys.executable, "-m", "embodiment.runners.api_runner.main"],
                env=env,
                stdout=open(f"./logs/agent_{agent_id}.log", "w"),
                stderr=subprocess.STDOUT,
            )

        except Exception as e:
            print(f"Failed to deploy agent API: {e}")
            print("error")
            raise RuntimeError(f"Failed to deploy agent API: {e}")

        # Step 4: Prepare the deployment metadata
        api_url = f"http://localhost:{port}"
        print(f"Deployed agent at: {api_url} (PID: {process.pid})")

        return {
            "url": api_url,
            "port": port,
            "pid": process.pid,
        }
