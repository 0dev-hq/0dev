from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from api.config import Config
from api.db import db
from api.controllers import register_blueprints
from api.hooks.before import authenticate
from api.models import *
import os
import logging

logger = logging.getLogger(__name__)


def create_app():
    """
    Application factory to create and configure the Flask app.
    """
    app = Flask(__name__)
    app.config.from_object(Config)
    Config.configure_logging()

    # Enable CORS for the front-end URL
    frontend_url = os.getenv("FRONTEND_URL", "*")
    CORS(app, resources={r"/*": {"origins": frontend_url}})

    # Initialize database and migration
    db.init_app(app)
    Migrate(app, db, directory="api/migrations")

    @app.before_request
    def require_authentication():
        if request.method == "OPTIONS":
            return jsonify({"message": "CORS preflight check"}), 200

        if request.path == "/health":
            return None

        if request.path.startswith("/integration/oauth"):
            return None

        return authenticate()

    # Register Blueprints
    register_blueprints(app)

    return app


if __name__ == "__main__":
    app = create_app()
    logger.info(f"API server started on port {Config.PORT}")
    app.run(host="0.0.0.0", port=int(Config.PORT), debug=False, use_reloader=False)
