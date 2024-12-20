import subprocess
import tempfile
import os
import shutil

from core.base_code_executor import BaseCodeExecutor


class LocalCodeExecutor(BaseCodeExecutor):
    def execute_job(self, job_id, code, requirements, inputs):
        self.update_job_status(job_id, "in_progress")

        # Temporary directory for virtual environment and script
        temp_dir = tempfile.mkdtemp()
        try:
            # Create a virtual environment
            venv_dir = os.path.join(temp_dir, "venv")
            subprocess.run(["python3", "-m", "venv", venv_dir], check=True)

            # Install dependencies
            pip_executable = os.path.join(venv_dir, "bin", "pip")
            if requirements:
                subprocess.run([pip_executable, "install"] + requirements, check=True)

            # Write the task code to a temporary file
            script_path = os.path.join(temp_dir, "task.py")
            with open(script_path, "w") as script_file:
                script_file.write(code)

            # Execute the script in the virtual environment
            python_executable = os.path.join(venv_dir, "bin", "python")
            result = subprocess.run(
                [python_executable, script_path], capture_output=True, text=True
            )

            # Handle success or failure
            if result.returncode == 0:
                self.update_job_status(job_id, "completed", {"output": result.stdout})
            else:
                self.update_job_status(job_id, "failed", {"error": result.stderr})
        except Exception as e:
            self.update_job_status(job_id, "failed", {"error": str(e)})
        finally:
            # Clean up temporary directory
            shutil.rmtree(temp_dir)
