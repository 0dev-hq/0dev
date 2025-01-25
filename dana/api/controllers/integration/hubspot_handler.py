import os
import requests
import urllib.parse
from .base_oauth_service_handler import BaseOAuthServiceHandler


class HubSpotOAuthHandler(BaseOAuthServiceHandler):

    def __init__(self):
        self.auth_url = f"https://app.hubspot.com/oauth/{os.getenv('INTEGRATION_OAUTH_HUBSPOT_ACC_ID')}/authorize"
        self.token_url = "https://api.hubapi.com/oauth/v1/token"
        self.scopes = ["crm.objects.contacts.read", "crm.objects.contacts.write"]

    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        client_id = os.getenv("INTEGRATION_OAUTH_HUBSPOT_CLIENT_ID")
        query_params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "scope": " ".join(self.scopes),
            "response_type": "code",
            "state": state,
        }
        return f"{self.auth_url}?{urllib.parse.urlencode(query_params)}"

    def exchange_token(self, authorization_code: str, redirect_uri: str) -> dict:
        client_id = os.getenv("INTEGRATION_OAUTH_HUBSPOT_CLIENT_ID")
        client_secret = os.getenv("INTEGRATION_OAUTH_HUBSPOT_CLIENT_SECRET")
        query_params = {
            "grant_type": "authorization_code",
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "code": authorization_code,
        }
        url = f"{self.token_url}?{urllib.parse.urlencode(query_params)}"

        response = requests.post(
            url, headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        # show error message if response is not successful
        print(response.json())

        response.raise_for_status()
        return response.json()
