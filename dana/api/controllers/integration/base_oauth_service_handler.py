from abc import ABC, abstractmethod


class BaseOAuthServiceHandler(ABC):
    """
    Abstract base class for handling OAuth flows for different services.
    """


    @abstractmethod
    def get_authorization_url(self, state: str, redirect_uri: str) -> str:
        """
        Generate the authorization URL for the service.
        :param state: CSRF token.
        :param redirect_uri: Redirect URI for the OAuth flow.
        :return: Authorization URL.
        """
        pass

    @abstractmethod
    def exchange_token(self, authorization_code: str, redirect_uri: str) -> dict:
        """
        Exchange the authorization code for tokens.
        :param authorization_code: Authorization code received from the service.
        :param redirect_uri: Redirect URI used in the OAuth flow.
        :return: Token data.
        """
        pass
