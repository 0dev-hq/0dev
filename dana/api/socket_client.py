import socketio
import os
import logging
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class DanaSocketClient:
    _instance = None  # Singleton instance

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DanaSocketClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """Initialize the Socket.IO client"""
        self.api_url = os.getenv("API_URL", "http://localhost:3000")
        self.secret = os.getenv("DANA_SIO_SECRET")

        if not self.secret:
            raise ValueError("DANA_SIO_SECRET is missing in environment variables.")

        logger.info(f"Connecting to {self.api_url}/dana with authentication...")

        self._sio = socketio.Client(reconnection=True, reconnection_attempts=5)

        self._sio.on("connect", self._on_connect, namespace="/dana")
        self._sio.on("disconnect", self._on_disconnect, namespace="/dana")

        self._connect()

    def _connect(self):
        """Establish the connection to the server"""
        try:
            self._sio.connect(
                self.api_url,
                namespaces=["/dana"],
                transports=["websocket"],
                auth={"token": self.secret},
            )
            logger.info("Dana successfully connected to the server.")
        except socketio.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect to the server: {e}")

    def _on_connect(self):
        """Handle successful connection"""
        logger.info("Connected to the server.")

    def _on_disconnect(self):
        """Handle disconnection"""
        logger.warning("Disconnected from the server.")

    def emit_event(self, event: str, data: dict):
        """Emit an event to the server, ensuring the connection is active"""
        if not self._sio.connected:
            logger.warning("Socket.IO is not connected. Reconnecting...")
            self._connect()

        logger.info(f"Emitting event: {event} | Data: {data}")
        self._sio.emit(event, data, namespace="/dana")

    def add_event_listener(self, event: str, callback: callable):
        """Add an event listener to the client"""
        self._sio.on(event, callback, namespace="/dana")


socket_client = DanaSocketClient()
