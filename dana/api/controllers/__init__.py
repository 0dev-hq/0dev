from .agents import agents_bp
from .controller import controller_bp
from .health import health_bp


def register_blueprints(app):
    """
    Register all Blueprints for the app.
    :param app: Flask app instance
    """
    app.register_blueprint(agents_bp, url_prefix="/agent")
    app.register_blueprint(controller_bp, url_prefix="/controller")
    app.register_blueprint(health_bp, url_prefix="/health")
