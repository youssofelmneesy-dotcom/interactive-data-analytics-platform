"""
Chart service for orchestrating chart data generation and configuration management.

Acts as the business logic layer between the API endpoints and the chart engine,
handling validation, data retrieval, and persistence of chart configurations.
"""

from typing import Any

import pandas as pd

from app.core.exceptions import NotFoundError, BadRequestError
from app.db.database import db_session
from app.engines.chart_engine import (
    generate_chart_data,
    recommend_charts,
    CHART_TYPES,
    AGGREGATIONS,
)
from app.services.dataset_service import get_dataset_dataframe, get_dataset


def get_chart_recommendations(dataset_id: str) -> list[dict[str, Any]]:
    """
    Generate automatic chart recommendations for a dataset.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        List of recommended chart configurations with reasons.

    Raises:
        NotFoundError: If dataset does not exist.
    """
    df = get_dataset_dataframe(dataset_id)
    return recommend_charts(df)


def generate_chart(
    dataset_id: str,
    chart_type: str,
    x_axis: str | None,
    y_axis: str | None,
    aggregation: str,
    group_by: str | None = None,
    filters: list[dict[str, Any]] | None = None,
    title: str | None = None,
    bins: int = 20,
) -> dict[str, Any]:
    """
    Generate chart data for a specific chart configuration.

    Args:
        dataset_id: Unique dataset identifier.
        chart_type: Type of chart to generate.
        x_axis: X-axis column name.
        y_axis: Y-axis column name.
        aggregation: Aggregation function name.
        group_by: Optional secondary grouping column.
        filters: Optional filter conditions.
        title: Optional chart title override.
        bins: Number of bins for histograms.

    Returns:
        Dictionary with chart data and configuration metadata.

    Raises:
        NotFoundError: If dataset does not exist.
        BadRequestError: If chart parameters are invalid.
    """
    df = get_dataset_dataframe(dataset_id)

    result = generate_chart_data(
        df=df,
        chart_type=chart_type,
        x_axis=x_axis,
        y_axis=y_axis,
        aggregation=aggregation,
        group_by=group_by,
        filters=filters,
        bins=bins,
    )

    if title:
        result["config"]["title"] = title

    return result


def save_chart_config(
    dataset_id: str,
    chart_type: str,
    title: str,
    x_axis: str | None,
    y_axis: str | None,
    aggregation: str,
    group_by: str | None = None,
    filters: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """
    Save a chart configuration to the database.

    Args:
        dataset_id: Unique dataset identifier.
        chart_type: Type of chart.
        title: Chart title.
        x_axis: X-axis column name.
        y_axis: Y-axis column name.
        aggregation: Aggregation function.
        group_by: Optional grouping column.
        filters: Optional filter conditions.

    Returns:
        Saved chart configuration with generated ID.

    Raises:
        NotFoundError: If dataset does not exist.
        BadRequestError: If chart type is invalid.
    """
    # Validate dataset exists
    get_dataset(dataset_id)

    if chart_type not in CHART_TYPES:
        raise BadRequestError(
            f"Invalid chart type '{chart_type}'. Supported: {', '.join(sorted(CHART_TYPES))}"
        )

    if aggregation not in AGGREGATIONS:
        raise BadRequestError(
            f"Invalid aggregation '{aggregation}'. Supported: {', '.join(sorted(AGGREGATIONS.keys()))}"
        )

    import json
    import uuid

    config_id = str(uuid.uuid4())

    with db_session() as conn:
        conn.execute(
            """
            INSERT INTO chart_configs (id, dataset_id, chart_type, title, config_json)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                config_id,
                dataset_id,
                chart_type,
                title,
                json.dumps({
                    "xAxis": x_axis,
                    "yAxis": y_axis,
                    "aggregation": aggregation,
                    "groupBy": group_by,
                    "filters": filters or [],
                }),
            ),
        )

    return {
        "id": config_id,
        "datasetId": dataset_id,
        "chartType": chart_type,
        "title": title,
        "xAxis": x_axis,
        "yAxis": y_axis,
        "aggregation": aggregation,
        "groupBy": group_by,
        "filters": filters or [],
        "createdAt": _now_iso(),
    }


def list_chart_configs(dataset_id: str) -> list[dict[str, Any]]:
    """
    List all saved chart configurations for a dataset.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        List of chart configuration dictionaries.

    Raises:
        NotFoundError: If dataset does not exist.
    """
    # Validate dataset exists
    get_dataset(dataset_id)

    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT id, dataset_id, chart_type, title, config_json, created_at
            FROM chart_configs
            WHERE dataset_id = ?
            ORDER BY created_at DESC
            """,
            (dataset_id,),
        ).fetchall()

    import json

    result = []
    for row in rows:
        config = json.loads(row["config_json"])
        result.append({
            "id": row["id"],
            "datasetId": row["dataset_id"],
            "chartType": row["chart_type"],
            "title": row["title"],
            "xAxis": config.get("xAxis"),
            "yAxis": config.get("yAxis"),
            "aggregation": config.get("aggregation"),
            "groupBy": config.get("groupBy"),
            "filters": config.get("filters", []),
            "createdAt": row["created_at"],
        })

    return result


def get_chart_config(chart_id: str) -> dict[str, Any]:
    """
    Retrieve a single chart configuration by ID.

    Args:
        chart_id: Unique chart configuration identifier.

    Returns:
        Chart configuration dictionary.

    Raises:
        NotFoundError: If chart configuration does not exist.
    """
    import json

    with db_session() as conn:
        row = conn.execute(
            """
            SELECT id, dataset_id, chart_type, title, config_json, created_at
            FROM chart_configs
            WHERE id = ?
            """,
            (chart_id,),
        ).fetchone()

    if row is None:
        raise NotFoundError(f"Chart configuration '{chart_id}' not found.")

    config = json.loads(row["config_json"])

    return {
        "id": row["id"],
        "datasetId": row["dataset_id"],
        "chartType": row["chart_type"],
        "title": row["title"],
        "xAxis": config.get("xAxis"),
        "yAxis": config.get("yAxis"),
        "aggregation": config.get("aggregation"),
        "groupBy": config.get("groupBy"),
        "filters": config.get("filters", []),
        "createdAt": row["created_at"],
    }


def delete_chart_config(chart_id: str) -> dict[str, str]:
    """
    Delete a chart configuration.

    Args:
        chart_id: Unique chart configuration identifier.

    Returns:
        Success confirmation.

    Raises:
        NotFoundError: If chart configuration does not exist.
    """
    with db_session() as conn:
        cursor = conn.execute(
            "DELETE FROM chart_configs WHERE id = ?",
            (chart_id,),
        )
        if cursor.rowcount == 0:
            raise NotFoundError(f"Chart configuration '{chart_id}' not found.")

    return {"message": "Chart configuration deleted successfully."}


def _now_iso() -> str:
    """Return current UTC time in ISO format."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


