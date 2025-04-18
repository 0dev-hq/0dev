from .agents import agents_bp
from .controller import controller_bp
from .health import health_bp
from .integration.integration import integration_bp
from .job import job_bp
from .interaction_history import interaction_history_bp


def register_blueprints(app):
    """
    Register all Blueprints for the app.
    :param app: Flask app instance
    """
    app.register_blueprint(agents_bp, url_prefix="/agent")
    app.register_blueprint(controller_bp, url_prefix="/controller")
    app.register_blueprint(health_bp, url_prefix="/health")
    app.register_blueprint(integration_bp, url_prefix="/integration")
    app.register_blueprint(job_bp, url_prefix="/job")
    app.register_blueprint(interaction_history_bp, url_prefix="/interaction_history")
