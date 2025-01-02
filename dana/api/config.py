import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """
    Configuration for the Flask app.
    """

    def _get_database_url():
        DB_USER = os.getenv("INTERNAL_DB_USER", "your_db_user")
        DB_PASSWORD = os.getenv("INTERNAL_DB_PASS", "your_db_password")
        DB_HOST = os.getenv("INTERNAL_DB_HOST", "localhost")
        DB_PORT = os.getenv("INTERNAL_DB_PORT", "5432")
        DB_NAME = os.getenv("INTERNAL_DB_NAME", "your_db_name")
        print(
            f"url in config: postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )
        return f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    DEBUG = os.getenv("DEBUG", True)
    SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
    PORT = os.getenv("PORT", 5000)
    SQLALCHEMY_DATABASE_URI = _get_database_url()  # Maps DB_URL to SQLAlchemy
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Best practice to disable this