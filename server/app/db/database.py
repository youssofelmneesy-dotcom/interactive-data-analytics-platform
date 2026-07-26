"""
SQLite database connection and session management.
"""
import sqlite3
from contextlib import contextmanager
from pathlib import Path

from app.core.config import settings

# Ensure the database directory exists
_db_path = settings.database_url.replace("sqlite:///", "")
Path(_db_path).parent.mkdir(parents=True, exist_ok=True)


def get_db_connection() -> sqlite3.Connection:
    """
    Create and return a new SQLite database connection.

    Returns:
        A SQLite connection with row factory set to sqlite3.Row.
    """
    conn = sqlite3.connect(_db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


@contextmanager
def db_session():
    """
    Context manager for database sessions.

    Yields a SQLite connection and ensures proper cleanup.
    Commits on success, rolls back on exception.
    """
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
        