import os
import sys
import json
import subprocess
import socket
from typing import Dict
from api.services.deployments.base_deployment import BaseDeployment
import logging

logger = logging.getLogger(__name__)


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

        logger.debug(f"Packaged agent configuration at: {config_file}")
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
        env = {}
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
                "DANA_URL": os.getenv("DANA_URL"),
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
            logger.error(f"Failed to deploy agent API: {e}")
            raise RuntimeError(f"Failed to deploy agent API: {e}")

        # Step 4: Prepare the deployment metadata
        api_url = f"http://localhost:{port}"
        logger.debug(f"Deployed agent at: {api_url} (PID: {process.pid})")

        return {
            "url": api_url,
            "port": port,
            "package_path": package_path,
            "pid": process.pid,
        }

    def destroy(self, deployment_metadata: dict) -> None:
        """
        Destroy the deployed agent, terminating its subprocess and cleaning up resources.
        :param deployment_metadata: Metadata containing information about the deployed agent, including its PID and package path.
        """
        pid = deployment_metadata.get("pid")
        package_path = deployment_metadata.get("package_path")

        if pid:
            try:
                # Terminate the subprocess
                os.kill(pid, 9)  # Use signal.SIGKILL (9) for termination
                logger.debug(f"Terminated process with PID: {pid}")
            except ProcessLookupError:
                logger.error(f"No process found with PID: {pid}")
            except Exception as e:
                logger.error(f"Failed to terminate process with PID {pid}: {e}")

        if package_path and os.path.exists(package_path):
            try:
                # Remove the agent's package directory
                import shutil

                shutil.rmtree(package_path)
                logger.debug(f"Cleaned up package at: {package_path}")
            except Exception as e:
                logger.error(f"Failed to clean up package at {package_path}: {e}")

        logger.info("Agent destroyed successfully.")
