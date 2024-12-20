import boto3
import os
import zipfile
import tempfile
import uuid
from core.base_code_executor import BaseCodeExecutor

class LambdaCodeExecutor(BaseCodeExecutor):
    def __init__(self):
        """
        Initialize the AWS Lambda client.
        """
        self.lambda_client = boto3.client("lambda", region_name=os.getenv("AWS_REGION"))

    def execute_job(self, job_id, task_code, inputs, requirements):
        """
        Deploy and execute the generated code as an AWS Lambda function.
        :param job_id: The job ID.
        :param task_code: The dynamically generated Python code to execute.
        :param inputs: The inputs required for the code.
        :param requirements: A list of Python packages required for the code.
        """
        self.update_job_status(job_id, "in_progress")

        function_name = f"agent_job_{job_id}"
        zip_file_path = self._create_lambda_package(task_code, requirements)

        try:
            # Create or update the Lambda function
            response = self._deploy_lambda_function(function_name, zip_file_path)

            # Invoke the Lambda function
            payload = {"inputs": inputs}
            invoke_response = self.lambda_client.invoke(
                FunctionName=function_name,
                InvocationType="RequestResponse",
                Payload=json.dumps(payload),
            )

            # Handle the response
            result_payload = invoke_response["Payload"].read().decode("utf-8")
            if invoke_response["StatusCode"] == 200:
                self.update_job_status(job_id, "completed", {"output": result_payload})
            else:
                self.update_job_status(job_id, "failed", {"error": result_payload})
        except Exception as e:
            self.update_job_status(job_id, "failed", {"error": str(e)})
        finally:
            # Optionally delete the Lambda function
            self._delete_lambda_function(function_name)
            # Clean up the zip file
            if os.path.exists(zip_file_path):
                os.remove(zip_file_path)

    def _create_lambda_package(self, task_code, requirements):
        """
        Create a ZIP package containing the generated code and dependencies for Lambda.
        :param task_code: The dynamically generated Python code to execute.
        :param requirements: A list of Python packages required for the code.
        :return: Path to the ZIP file.
        """
        temp_dir = tempfile.mkdtemp()
        zip_file_path = os.path.join(temp_dir, "lambda_package.zip")
        try:
            # Write the task code to a file
            handler_path = os.path.join(temp_dir, "lambda_function.py")
            with open(handler_path, "w") as handler_file:
                handler_file.write(f"""
import json

def lambda_handler(event, context):
    inputs = event.get("inputs", {})
    # Dynamically injected code starts here
{task_code}
    # Dynamically injected code ends here
    return {{"status": "success", "inputs": inputs}}
                """)

            # Write requirements to a requirements.txt file
            requirements_path = os.path.join(temp_dir, "requirements.txt")
            with open(requirements_path, "w") as req_file:
                req_file.write("\n".join(requirements))

            # Install dependencies into a temporary directory
            install_dir = os.path.join(temp_dir, "package")
            subprocess.run(["pip", "install", "-r", requirements_path, "-t", install_dir], check=True)

            # Create a ZIP archive
            with zipfile.ZipFile(zip_file_path, "w") as zip_file:
                # Add installed dependencies
                for root, _, files in os.walk(install_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        zip_file.write(file_path, os.path.relpath(file_path, install_dir))

                # Add the handler file
                zip_file.write(handler_path, "lambda_function.py")

            return zip_file_path
        except Exception as e:
            print(f"Error creating Lambda package: {e}")
            raise
        finally:
            shutil.rmtree(temp_dir)

    def _deploy_lambda_function(self, function_name, zip_file_path):
        """
        Deploy the Lambda function using the provided ZIP package.
        :param function_name: Name of the Lambda function.
        :param zip_file_path: Path to the ZIP file containing the code and dependencies.
        :return: Response from AWS Lambda.
        """
        with open(zip_file_path, "rb") as zip_file:
            try:
                response = self.lambda_client.create_function(
                    FunctionName=function_name,
                    Runtime="python3.9",
                    Role=os.getenv("LAMBDA_EXECUTION_ROLE"),
                    Handler="lambda_function.lambda_handler",
                    Code={"ZipFile": zip_file.read()},
                    Timeout=300,
                    MemorySize=128,
                )
            except self.lambda_client.exceptions.ResourceConflictException:
                response = self.lambda_client.update_function_code(
                    FunctionName=function_name,
                    ZipFile=zip_file.read(),
                )
        return response

    def _delete_lambda_function(self, function_name):
        """
        Delete the Lambda function after execution.
        :param function_name: Name of the Lambda function.
        """
        try:
            self.lambda_client.delete_function(FunctionName=function_name)
        except Exception as e:
            print(f"Error deleting Lambda function {function_name}: {e}")
