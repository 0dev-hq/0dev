import os
import psutil
from multiprocessing import Process
import time

class LocalRuntime(Runtime):
    """
    Runtime implementation for running agents as local processes.
    """

    def __init__(self):
        self.running_agents = {}  # Track running agent processes

    def run_agent(self, agent_id: str, agent_artifact: str, config: dict) -> str:
        def agent_main():
            os.system(f"python {agent_artifact}")
        
        process = Process(target=agent_main)
        process.start()
        runtime_instance_id = f"{agent_id}-{process.pid}"
        self.running_agents[runtime_instance_id] = process
        print(f"Agent {agent_id} started with PID {process.pid}.")
        return runtime_instance_id

    def stop_agent(self, runtime_instance_id: str) -> bool:
        process = self.running_agents.get(runtime_instance_id)
        if process and process.is_alive():
            process.terminate()
            process.join()
            del self.running_agents[runtime_instance_id]
            print(f"Agent {runtime_instance_id} stopped.")
            return True
        print(f"Agent {runtime_instance_id} not running.")
        return False

    def get_metrics(self, runtime_instance_id: str) -> dict:
        process = self.running_agents.get(runtime_instance_id)
        if process and process.is_alive():
            proc = psutil.Process(process.pid)
            return {
                "pid": process.pid,
                "cpu_percent": proc.cpu_percent(),
                "memory_percent": proc.memory_percent(),
                "uptime": time.time() - proc.create_time()
            }
        return {"error": "Agent not running."}

    def describe(self) -> dict:
        return {
            "type": "Local",
            "max_processes": os.cpu_count(),
            "description": "Local runtime using Python processes."
        }
