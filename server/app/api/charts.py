"""
Chart API endpoints for data visualization.

Provides endpoints for:
- Chart recommendations (auto-generated based on column types)
- Chart data generation (on-demand chart rendering)
- Chart configuration CRUD (save/load/delete chart presets)
"""

from typing import Any

from fastapi import APIRouter, Query

from app.services.chart_service import (
    get_chart_recommendations,
    generate_chart,
    save_chart_config,
    list_chart_configs,
    get_chart_config,
    delete_chart_config,
)
from app.core.exceptions import BadRequestError

router = APIRouter()


@router.get("/{dataset_id}/charts/recommendations")
def read_chart_recommendations(dataset_id: str) -> list[dict[str, Any]]:
    """
    Get automatic chart recommendations for a dataset.

    Analyzes column types and suggests the most useful visualizations.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        List of recommended chart configurations with explanations.
    """
    return get_chart_recommendations(dataset_id)


@router.post("/{dataset_id}/charts")
def create_chart(
    dataset_id: str,
    body: dict[str, Any],
) -> dict[str, Any]:
    """
    Generate chart data for a specific configuration.

    Request body:
        - chartType: Chart type (bar, line, pie, histogram, scatter, box, heatmap)
        - xAxis: X-axis column name (optional for some charts)
        - yAxis: Y-axis column name (optional for some charts)
        - aggregation: Aggregation function (sum, count, mean, median, min, max, std)
        - groupBy: Optional secondary grouping column
        - filters: Optional list of filter conditions
        - title: Optional chart title override
        - bins: Number of bins for histograms (default: 20)

    Args:
        dataset_id: Unique dataset identifier.
        body: Chart configuration.

    Returns:
        Chart data and metadata ready for rendering.
    """
    chart_type = body.get("chartType")
    x_axis = body.get("xAxis")
    y_axis = body.get("yAxis")
    aggregation = body.get("aggregation", "count")
    group_by = body.get("groupBy")
    filters = body.get("filters")
    title = body.get("title")
    bins = body.get("bins", 20)

    if not chart_type:
        raise BadRequestError("chartType is required.")

    return generate_chart(
        dataset_id=dataset_id,
        chart_type=chart_type,
        x_axis=x_axis,
        y_axis=y_axis,
        aggregation=aggregation,
        group_by=group_by,
        filters=filters,
        title=title,
        bins=bins,
    )


@router.post("/{dataset_id}/charts/save")
def save_chart(
    dataset_id: str,
    body: dict[str, Any],
) -> dict[str, Any]:
    """
    Save a chart configuration for later reuse.

    Request body:
        - chartType: Chart type
        - title: Chart title
        - xAxis: X-axis column name
        - yAxis: Y-axis column name
        - aggregation: Aggregation function
        - groupBy: Optional grouping column
        - filters: Optional filter conditions

    Args:
        dataset_id: Unique dataset identifier.
        body: Chart configuration to save.

    Returns:
        Saved chart configuration with generated ID.
    """
    chart_type = body.get("chartType")
    title = body.get("title")
    x_axis = body.get("xAxis")
    y_axis = body.get("yAxis")
    aggregation = body.get("aggregation", "count")
    group_by = body.get("groupBy")
    filters = body.get("filters")

    if not chart_type:
        raise BadRequestError("chartType is required.")
    if not title:
        raise BadRequestError("title is required.")

    return save_chart_config(
        dataset_id=dataset_id,
        chart_type=chart_type,
        title=title,
        x_axis=x_axis,
        y_axis=y_axis,
        aggregation=aggregation,
        group_by=group_by,
        filters=filters,
    )


@router.get("/{dataset_id}/charts")
def read_saved_charts(dataset_id: str) -> list[dict[str, Any]]:
    """
    List all saved chart configurations for a dataset.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        List of saved chart configurations.
    """
    return list_chart_configs(dataset_id)


@router.get("/{dataset_id}/charts/{chart_id}")
def read_saved_chart(dataset_id: str, chart_id: str) -> dict[str, Any]:
    """
    Get a single saved chart configuration.

    Args:
        dataset_id: Unique dataset identifier.
        chart_id: Unique chart configuration identifier.

    Returns:
        Chart configuration details.
    """
    return get_chart_config(chart_id)


@router.delete("/{dataset_id}/charts/{chart_id}")
def remove_saved_chart(dataset_id: str, chart_id: str) -> dict[str, str]:
    """
    Delete a saved chart configuration.

    Args:
        dataset_id: Unique dataset identifier.
        chart_id: Unique chart configuration identifier.

    Returns:
        Success confirmation.
    """
    return delete_chart_config(chart_id)

