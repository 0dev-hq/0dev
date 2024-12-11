from threading import Thread
import time


class LocalController(Controller):
    """
    Controller implementation for managing agents in a local environment.
    """

    def __init__(self, runtime):
        """
        Initialize the LocalController.
        :param runtime: Instance of the Runtime responsible for agent execution.
        """
        self.runtime = runtime
        self.agent_instances = {}  # Tracks runtime instances by agent_id

    def scale_agent(self, agent_id: str, scale_config: dict) -> bool:
        """
        Scale the number of instances of an agent.
        """
        replicas = scale_config.get("replicas", 1)
        for i in range(replicas):
            runtime_instance_id = self.runtime.run_agent(
                agent_id=f"{agent_id}-{i}",
                agent_artifact=scale_config.get("artifact", "./agent_artifact.py"),
                config=scale_config.get("runtime_config", {}),
            )
            self.agent_instances[runtime_instance_id] = agent_id
        print(f"Scaled agent {agent_id} to {replicas} instances.")
        return True

    def monitor_agent(self, runtime_instance_id: str) -> dict:
        """
        Monitor the state and metrics of a running agent instance.
        """
        metrics = self.runtime.get_metrics(runtime_instance_id)
        if "error" in metrics:
            print(f"Monitoring error for {runtime_instance_id}: {metrics['error']}")
        return metrics

    def recover_agent(self, runtime_instance_id: str) -> bool:
        """
        Recover a failed agent by restarting it.
        """
        if runtime_instance_id not in self.agent_instances:
            print(f"No record of agent instance {runtime_instance_id}.")
            return False

        agent_id = self.agent_instances[runtime_instance_id]
        print(f"Recovering agent instance {runtime_instance_id} for agent {agent_id}...")
        
        self.runtime.stop_agent(runtime_instance_id)
        new_instance_id = self.runtime.run_agent(
            agent_id=agent_id,
            agent_artifact="./agent_artifact.py",  # Replace with stored artifact path
            config={},  # Runtime config for recovery
        )
        self.agent_instances[new_instance_id] = agent_id
        del self.agent_instances[runtime_instance_id]

        print(f"Recovered agent {agent_id} as new instance {new_instance_id}.")
        return True

    def schedule_agent(self, agent_id: str, schedule: dict) -> bool:
        """
        Schedule an agent to start/stop at specific times.
        """

        start_time = schedule.get("start_time")
        stop_time = schedule.get("stop_time")

        def start_agent():
            time.sleep(self._time_until(start_time))
            runtime_instance_id = self.runtime.run_agent(
                agent_id=agent_id,
                agent_artifact="./agent_artifact.py",  # Replace with stored artifact path
                config={},  # Runtime config for scheduled start
            )
            self.agent_instances[runtime_instance_id] = agent_id
            print(f"Agent {agent_id} started as per schedule.")

        def stop_agent():
            time.sleep(self._time_until(stop_time))
            for instance_id, managed_agent_id in list(self.agent_instances.items()):
                if managed_agent_id == agent_id:
                    self.runtime.stop_agent(instance_id)
                    del self.agent_instances[instance_id]
            print(f"Agent {agent_id} stopped as per schedule.")

        if start_time:
            Thread(target=start_agent).start()
        if stop_time:
            Thread(target=stop_agent).start()
        return True

    def list_agents(self) -> list:
        """
        List all managed agents and their statuses.
        """
        agents = []
        for instance_id, agent_id in self.agent_instances.items():
            metrics = self.runtime.get_metrics(instance_id)
            agents.append({"agent_id": agent_id, "runtime_instance_id": instance_id, "metrics": metrics})
        return agents

    def _time_until(self, target_time):
        """Calculate seconds until a target time."""
        now = time.time()
        return max(target_time - now, 0)
