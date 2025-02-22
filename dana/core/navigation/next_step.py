from enum import Enum


class NextStep(Enum):
    PLAN = "plan"  # Generate a task plan or custom code
    ANSWER = "answer"  # Generate an answer to a question
    Question = "question"  # Ask for more information
    Option = "option"  # Provide options to choose from
    CONFIRM_EXECUTION = "confirm_execution"  # Require user confirmation for execution
    EXECUTE = "execute"  # Execute a confirmed plan
    NONE = "none"  # Deny the request
