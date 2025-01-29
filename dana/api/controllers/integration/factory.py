from .hubspot_handler import HubSpotOAuthHandler


class OAuthHandlerFactory:
    """
    Factory to return the appropriate OAuth handler.
    """

    OAUTH_HANDLERS = {
        "hubspot": HubSpotOAuthHandler,
    }

    @staticmethod
    def get_handler(service: str):
        handler_class = OAuthHandlerFactory.OAUTH_HANDLERS.get(service.lower())
        if not handler_class:
            raise ValueError(f"Unsupported service: {service}")
        return handler_class()
