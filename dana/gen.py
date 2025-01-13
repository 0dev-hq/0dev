



from llm.openai import OpenAIClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

llm_client = OpenAIClient(api_key=os.getenv("OPENAI_API_KEY"))



actions = []
with open("gen_actions.txt", "r") as file:
    actions = file.readlines()

for action in actions:
    
    (functionality, file_name) = action.split("::::")

    prompt = (
        f"I need a python code that implements {functionality.strip()}."
        f"Your response should be in JSON format and have exactly these three keys: 'code', 'requirements', 'test_code'." 
        f"Requirements should be a list of strings."
        f"Your code should be compatible with Python 3.8+."
        f"test_code should be a string that tests the functionality of the code. Use dummy data if necessary."
    )
    response = llm_client.answer([
        {"role": "system", "content": "You are a developer that generates code for a given functionality."},
        {"role": "user", "content": prompt},
    ], format="json")

    print(response)

    if response:
        parsed = json.loads(response)
        print(parsed["requirements"])
        # write the file under registry folder
        with open(f"registry/{file_name.strip()}.py", "w") as file:
            file.write(parsed["code"])
        with open(f"registry/{file_name.strip()}_requirements.txt", "w") as requirements_file:
            requirements_file.write("\n".join(parsed["requirements"]))
        with open(f"registry/{file_name.strip()}_test.py", "w") as test_file:
            test_file.write(parsed["test_code"])

        print(f"Successfully generated code for {file_name.strip()}")
    else:
        print(f"Failed to generate code for {file_name.strip()}")
    
