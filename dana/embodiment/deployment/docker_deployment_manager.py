import os
import subprocess

class DockerDeploymentManager(DeploymentManager):
    """
    DeploymentManager implementation for Docker-based environments.
    """

    def package(self, agent_id: str, agent_config: dict) -> str:
        # Create a temporary directory for packaging
        package_path = f"./temp/{agent_id}"
        os.makedirs(package_path, exist_ok=True)

        # Copy agent code and dependencies to the package directory
        agent_code_path = agent_config["code_path"]
        os.system(f"cp -r {agent_code_path}/* {package_path}/")

        print(f"Agent {agent_id} packaged at {package_path}")
        return package_path

    def build(self, package_path: str, build_config: dict) -> str:
        # Build a Docker image
        image_name = build_config["image_name"]
        dockerfile_path = build_config["dockerfile_path"]

        subprocess.run(
            ["docker", "build", "-t", image_name, "-f", dockerfile_path, package_path],
            check=True
        )

        print(f"Docker image built: {image_name}")
        return image_name

    def deploy(self, build_artifact: str, deploy_config: dict) -> str:
        # Deploy the Docker container
        container_name = deploy_config["container_name"]
        port_mapping = deploy_config["port_mapping"]

        subprocess.run(
            ["docker", "run", "-d", "--name", container_name, "-p", port_mapping, build_artifact],
            check=True
        )

        print(f"Container deployed: {container_name}")
        return container_name

    def rollback(self, deployment_id: str) -> bool:
        # Stop and remove the container
        subprocess.run(["docker", "rm", "-f", deployment_id], check=True)
        print(f"Rollback successful for {deployment_id}")
        return True

    def list_deployments(self, agent_id: str) -> list:
        # List all containers for the given agent
        result = subprocess.run(["docker", "ps", "-a", "--filter", f"name={agent_id}", "--format", "{{.ID}}"], capture_output=True)
        deployments = result.stdout.decode().strip().split("\n")
        return deployments
