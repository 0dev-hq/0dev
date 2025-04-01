import subprocess
import tempfile
import os
import logging
import sys
import importlib.util
import traceback
import json

from core.execution.base_code_executor import BaseCodeExecutor
from core.perception.perception_handler import InputItemFormat


logger = logging.getLogger(__name__)


def is_standard_library(module_name: str) -> bool:
    """Check if a module is part of the standard library."""
    if hasattr(sys, "stdlib_module_names"):
        return module_name in sys.stdlib_module_names  # Python 3.10+
    spec = importlib.util.find_spec(module_name)
    if spec is None:
        return False  # Module does not exist
    module_path = spec.origin
    return (
        module_path
        and "site-packages" not in module_path
        and os.path.dirname(module_path).startswith(os.path.dirname(os.__file__))
    )


class LocalCodeExecutor(BaseCodeExecutor):
    def execute_code(
        self,
        account_id: str,
        agent_id: str,
        session_id: str,
        code: str,
        requirements: list,
        inputs: list[InputItemFormat],
        secrets: dict,
        integrations: dict,
        name: str,
        description: str,
    ) -> str:
        job_id = self.job_manager.create_job(
            session_id=session_id, name=name, description=description
        )

        interaction = {
            "type": "job",
            "content": {
                "job_id": job_id,
                "name": name,
                "description": description,
                "status": "created",
            },
        }

        self.history_manager.save_interaction(
            account_id=account_id,
            agent_id=agent_id,
            session_id=session_id,
            interaction=interaction,
        )

        # todo: ideally this should be triggered when the code execution starts
        self.job_manager.update_job_status(
            job_id=job_id,
            session_id=session_id,
            status="in_progress",
            payload={},
        )

        interaction = {
            "type": "job",
            "content": {
                "job_id": job_id,
                "name": name,
                "description": description,
                "status": "in_progress",
            },
        }
        self.history_manager.save_interaction(
            account_id=account_id,
            agent_id=agent_id,
            session_id=session_id,
            interaction=interaction,
        )

        logger.info(f"Updated job status to 'in_progress' for job_id: {job_id}")

        # Temporary directory for virtual environment and script
        temp_dir = tempfile.mkdtemp()
        job_final_status = "failed"
        job_exec_result = {"error": "Execution did not complete"}
        try:
            # Create a virtual environment
            venv_dir = os.path.join(temp_dir, "venv")
            subprocess.run(["python3", "-m", "venv", venv_dir], check=True)

            logger.info(f"Created virtual environment at: {venv_dir}")

            # Install dependencies
            non_standard_requirements = [
                requirement
                for requirement in requirements
                if not is_standard_library(requirement)
            ]

            logger.info(f"Non-standard requirements: {non_standard_requirements}")

            if non_standard_requirements:
                logger.info(f"Installing requirements: {non_standard_requirements}")
                pip_executable = os.path.join(venv_dir, "bin", "pip")
                subprocess.run(
                    [pip_executable, "install"] + non_standard_requirements, check=True
                )

            # Write the task code to a temporary file
            logger.info(f"Writing task code to a temporary file: {temp_dir}/task.py")
            script_path = os.path.join(temp_dir, "task.py")
            with open(script_path, "w") as script_file:
                script_file.write(code)

            # Write the caller script to a temporary file
            caller_script_path = os.path.join(temp_dir, "main.py")
            logger.info(
                f"Writing caller script to a temporary file: {temp_dir}/main.py"
            )

            args = {}
            args["inputs"] = (
                ", ".join(
                    [
                        f"{input_item.name}={repr(input_item.get_typed_value())}"
                        for input_item in inputs
                    ]
                )
                if inputs
                else ""
            )
            if secrets:
                args["secrets"] = secrets
            if integrations:
                args["integrations"] = integrations

            args_str = ", ".join([f"{k}={v}" for k, v in args.items() if v])

            output_file = os.path.join(temp_dir, "0dev.out")

            with open(caller_script_path, "w") as caller_script_file:
                caller_script_file.write(
                    f"""
import task
import json
import time
import os
result=task.main({args_str})
with open('{output_file}', 'w') as f:
    f.write(json.dumps(result))
"""
                )

            # Execute the script in the virtual environment
            python_executable = os.path.join(venv_dir, "bin", "python")
            logger.info(f"Executing script with Python: {python_executable}")
            executionResult = subprocess.run(
                [python_executable, caller_script_path],
                check=True,
                cwd=temp_dir,
                timeout=240,
            )

            logger.info(f"Result: {executionResult}")

            # read the output file and store it in the result
            with open(f"{output_file}", "r") as f:
                output = f.read()
            logger.info(f"Output: {output}")
            try:
                parsedOutput = json.loads(output)
                print("parsedOutput", parsedOutput)
            except json.JSONDecodeError:
                parsedOutput = {"status": "failed", "error": "Invalid JSON output"}

            if (
                executionResult.returncode == 0
                and parsedOutput.get("status") == "success"
            ):
                self.job_manager.update_job_status(
                    job_id=job_id,
                    session_id=session_id,
                    status="completed",
                    payload=output,
                )
                job_final_status = "completed"
                job_exec_result = parsedOutput
            else:
                self.job_manager.update_job_status(
                    job_id=job_id,
                    session_id=session_id,
                    status="failed",
                    payload=output,
                )
                job_final_status = "failed"
                job_exec_result = parsedOutput

        except Exception as e:
            logger.error(
                f"Error during subprocess execution:\n {traceback.format_exc()}"
            )
            self.job_manager.update_job_status(
                job_id=job_id,
                session_id=session_id,
                status="failed",
                payload={"error": str(e)},
            )
            job_final_status = "failed"
            job_exec_result = {"error": str(e)}

        finally:
            # Clean up temporary directory
            # todo: uncomment this line
            # shutil.rmtree(temp_dir)

            interaction = {
                "type": "job",
                "content": {
                    "job_id": job_id,
                    "status": job_final_status,
                    "payload": job_exec_result,
                },
            }

            self.history_manager.save_interaction(
                account_id=account_id,
                agent_id=agent_id,
                session_id=session_id,
                interaction=interaction,
            )

            return job_id
