"""
SQLite table schema definitions.

Tables are created on application startup via init_db().
"""
from app.db.database import get_db_connection


# SQL for creating all application tables
_CREATE_TABLES_SQL = """
-- Datasets table: stores metadata about uploaded files
CREATE TABLE IF NOT EXISTS datasets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    row_count INTEGER DEFAULT 0,
    column_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cleaning jobs table: tracks data cleaning operations
CREATE TABLE IF NOT EXISTS cleaning_jobs (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    rules_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

-- Chart configurations table: stores saved chart settings
CREATE TABLE IF NOT EXISTS chart_configs (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    chart_type TEXT NOT NULL,
    title TEXT,
    config_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

-- Insights table: stores AI-generated insights
CREATE TABLE IF NOT EXISTS insights (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'info',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

-- Reports table: stores generated report metadata
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    dataset_id TEXT NOT NULL,
    title TEXT NOT NULL,
    file_path TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);
"""


def init_db() -> None:
    """
    Initialize the SQLite database by creating all required tables.

    This function is called once during application startup.
    """
    conn = get_db_connection()
    try:
        conn.executescript(_CREATE_TABLES_SQL)
        conn.commit()
    finally:
        conn.close()
        
        