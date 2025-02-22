import socketio
import os
import logging
import time
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()


class SocketClient:
    _instance = None  # Singleton instance

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SocketClient, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.api_url = os.getenv("API_URL", "http://localhost:3000")
        print(f"API URL: {self.api_url}")
        self.secret = os.getenv("DANA_SIO_SECRET")

        if not self.secret:
            raise ValueError("DANA_SIO_SECRET is missing in environment variables.")

        self.sio = socketio.Client(reconnection=True, reconnection_attempts=5)

        # Register event handlers
        self.sio.on("connect", self.on_connect)
        self.sio.on("disconnect", self.on_disconnect)
        self.sio.on("connect_error", lambda e: logger.error(f"Connection error: {e}"))

    def connect(self):
        """Connect to the server with authentication."""
        try:
            if self.sio.connected:
                logger.info("Socket.IO is already connected.")
                return
            logger.info(f"Connecting to {self.api_url} with Socket.IO...")
            self.sio.connect(
                self.api_url,
                namespaces="/dana",
                auth={"token": self.secret},
                transports=["websocket"],
            )
        except socketio.exceptions.ConnectionError as e:
            logger.error(f"Failed to connect: {e}")
            time.sleep(5)
            self.connect()

    def on_connect(self):
        """Handle successful connection."""
        logger.info("Dana connected to Socket.IO server.")

    def on_disconnect(self):
        """Handle disconnection and attempt reconnection."""
        logger.warning("Dana disconnected from Socket.IO server.")
        self.connect()

    def emit(self, event: str, data: dict):
        """Emit a message to the server."""
        if not self.sio.connected:
            logger.warning("Socket.IO is not connected. Reconnecting...")
            self.connect()

        logger.info(f"Emitting event: {event} | Data: {data}")
        self.sio.emit(event, data)


socket_client = SocketClient()
