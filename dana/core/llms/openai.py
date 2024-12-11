# A simple abstraction to generate completions and embeddings

from openai import OpenAI

class OpenAIClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = OpenAI(api_key=api_key)

    def answer(self, prompt: any, format: str) -> str:
        """
        Generate a text completion for a given prompt using GPT.
        """
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=prompt,
            )
            # print(response.choices[0].message)
            return self.format_response(response.choices[0].message.content, format)
        except Exception as e:
            print(f"Error generating completion: {e}")
            return None
        
    def format_response(self, response: str, format: str) -> str:
        """
        Format the response based on the requested format.
        """
        if format == "json":
            # Response is like ```json <response>``` so we need to extract the response.
            return response[7:-3]
        elif format == "yaml":
            # Response is like ```yaml <response>``` so we need to extract the response.
            return response[7:-3]
        elif format == "text":
            return response
        else:
            raise ValueError(f"Unsupported format: {format}")

