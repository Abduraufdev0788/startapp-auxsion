import os
from alembic import command
from alembic.config import Config
from app.core.logging import logger


def run_upgrade_head() -> None:
    """Run Alembic migrations programmatically up to head."""
    try:
        current_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        ini_path = os.path.join(current_dir, "alembic.ini")
        alembic_cfg = Config(ini_path)
        command.upgrade(alembic_cfg, "head")
        logger.info("Database migrations successfully executed to HEAD.")
    except Exception as e:
        logger.error(f"Error executing database migrations: {e}")
        raise

