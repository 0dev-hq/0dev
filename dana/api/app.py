from flask import Flask, request
from flask_migrate import Migrate
from api.config import Config
from api.db import db
from api.controllers import register_blueprints
from dotenv import load_dotenv
from api.hooks.before import authenticate
from api.models import *
import os

load_dotenv()


def create_app():
    """
    Application factory to create and configure the Flask app.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize database and migration
    db.init_app(app)
    Migrate(app, db, directory="api/migrations")

    @app.before_request
    def require_authentication():
        if request.endpoint not in ["health"]:
            return authenticate()

    # Register Blueprints
    register_blueprints(app)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(Config.PORT), debug=False, use_reloader=False)
