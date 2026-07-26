"""
AI Insights API endpoints.

Provides endpoints for:
- Generating AI-powered insights (summary, anomaly, correlation, trend, outlier)
- Listing stored insights
- Retrieving individual insights
- Deleting insights
"""

from typing import Any

from fastapi import APIRouter, Query

from app.services.insights_service import (
    generate_all_insights,
    generate_summary_insight,
    generate_anomaly_insights,
    generate_correlation_insights,
    generate_trend_insights,
    generate_outlier_insights,
    list_insights,
    get_insight,
    delete_insight,
)
from app.core.exceptions import BadRequestError

router = APIRouter()


@router.post("/{dataset_id}/insights/generate")
def create_insights(
    dataset_id: str,
    body: dict[str, Any],
) -> list[dict[str, Any]]:
    """Generate AI-powered insights for a dataset.

    Request body:
        - types: List of insight types to generate
                 ["summary", "anomaly", "correlation", "trend", "outlier"]
        - column: Optional target column for anomaly detection
        - maxInsights: Maximum number of insights per type (default: 5)

    Args:
        dataset_id: Unique dataset identifier.
        body: Generation configuration.

    Returns:
        List of generated insights.
    """
    types = body.get("types", ["summary", "anomaly", "correlation", "trend", "outlier"])
    valid_types = {"summary", "anomaly", "correlation", "trend", "outlier"}

    invalid = set(types) - valid_types
    if invalid:
        raise BadRequestError(f"Invalid insight types: {', '.join(invalid)}. Valid: {', '.join(valid_types)}")

    return generate_all_insights(dataset_id, types=types)


@router.get("/{dataset_id}/insights")
def read_insights(
    dataset_id: str,
    type: str | None = Query(None, description="Filter by insight type"),
) -> list[dict[str, Any]]:
    """List all stored insights for a dataset.

    Args:
        dataset_id: Unique dataset identifier.
        type: Optional filter by insight type.

    Returns:
        List of insights.
    """
    insights = list_insights(dataset_id)
    if type:
        insights = [i for i in insights if i.get("type") == type]
    return insights


@router.get("/{dataset_id}/insights/{insight_id}")
def read_insight(dataset_id: str, insight_id: str) -> dict[str, Any]:
    """Get a single insight by ID.

    Args:
        dataset_id: Unique dataset identifier.
        insight_id: Unique insight identifier.

    Returns:
        Insight details.
    """
    return get_insight(insight_id)


@router.delete("/{dataset_id}/insights/{insight_id}")
def remove_insight(dataset_id: str, insight_id: str) -> dict[str, str]:
    """Delete an insight.

    Args:
        dataset_id: Unique dataset identifier.
        insight_id: Unique insight identifier.

    Returns:
        Success confirmation.
    """
    return delete_insight(insight_id)

