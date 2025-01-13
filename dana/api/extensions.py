from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Instantiate extensions
db = SQLAlchemy()
migrate = Migrate()
