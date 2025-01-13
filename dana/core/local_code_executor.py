import subprocess
import tempfile
import os
import shutil
import logging
import sys
import importlib.util

from core.base_code_executor import BaseCodeExecutor
from core.perception_handler import InputItemFormat


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
    def execute_job(
        self,
        job_id: str,
        secret: str,
        code: str,
        requirements: list,
        inputs: list[InputItemFormat],
    ):
        self.update_job_status(job_id, "in_progress", secret)

        logger.info(f"Updated job status to 'in_progress' for job_id: {job_id}")

        # Temporary directory for virtual environment and script
        temp_dir = tempfile.mkdtemp()
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

            with open(caller_script_path, "w") as caller_script_file:
                caller_script_file.write(
                    f"""
import task

task.main({', '.join([f'{input_item.name}={repr(input_item.get_typed_value())}' for input_item in inputs])})
"""
                )

            # Execute the script in the virtual environment
            # Gets stuck here without any output or error
            python_executable = os.path.join(venv_dir, "bin", "python")
            logger.info(f"Executing script with Python: {python_executable}")
            # Run subprocess with timeout and improved error handling
            try:
                result = subprocess.run(
                    [python_executable, caller_script_path],
                    # stdout=subprocess.PIPE,
                    # stderr=subprocess.PIPE,
                    # text=True,
                    check=True,
                    timeout=60,  # Prevent indefinite hangs
                )
                # logger.info(f"Subprocess stdout: {result.stdout}")
                # logger.error(f"Subprocess stderr: {result.stderr}")
                logger.info(f"Result: {result}")

                # Handle result
                if result.returncode == 0:
                    self.update_job_status(job_id, "completed", secret, {"output": result.stdout})
                else:
                    self.update_job_status(job_id, "failed", secret, {"error": result.stderr})
            except subprocess.TimeoutExpired as e:
                logger.error(f"Subprocess timed out: {str(e)}")
                self.update_job_status(job_id, "failed", secret, {"error": "Timeout expired"})
            except Exception as e:
                logger.error(f"Error during subprocess execution: {str(e)}")
                self.update_job_status(job_id, "failed", secret, {"error": str(e)})
        finally:
            # Clean up temporary directory
            # todo: uncomment this line
            # shutil.rmtree(temp_dir)
            pass
