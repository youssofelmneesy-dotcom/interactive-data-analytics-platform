"""
Report generation API endpoints.

Provides endpoints for:
- Creating and generating PDF reports
- Listing generated reports
- Downloading report files
- Deleting reports
"""

from typing import Any

from fastapi import APIRouter, Query
from fastapi.responses import FileResponse

from app.services.report_service import (
    create_report_config,
    list_reports,
    get_report,
    delete_report,
)
from app.core.exceptions import BadRequestError, NotFoundError

router = APIRouter()


@router.post("/{dataset_id}/reports")
def create_report(
    dataset_id: str,
    body: dict[str, Any],
) -> dict[str, Any]:
    """Generate a new PDF report for a dataset.

    Request body:
        - title: Report title (required)
        - description: Optional report description
        - sectionTypes: Types of sections to include
                        ["summary", "chart", "insight", "table", "text"]
        - includeCharts: Whether to include saved charts (default: true)
        - includeInsights: Whether to include AI insights (default: true)

    Args:
        dataset_id: Unique dataset identifier.
        body: Report configuration.

    Returns:
        Report metadata with file path.
    """
    title = body.get("title")
    if not title:
        raise BadRequestError("Report title is required.")

    description = body.get("description")
    section_types = body.get("sectionTypes")
    include_charts = body.get("includeCharts", True)
    include_insights = body.get("includeInsights", True)

    return create_report_config(
        dataset_id=dataset_id,
        title=title,
        description=description,
        section_types=section_types,
        include_charts=include_charts,
        include_insights=include_insights,
    )


@router.get("/{dataset_id}/reports")
def read_reports(dataset_id: str) -> list[dict[str, Any]]:
    """List all generated reports for a dataset.

    Args:
        dataset_id: Unique dataset identifier.

    Returns:
        List of report metadata.
    """
    return list_reports(dataset_id)


@router.get("/{dataset_id}/reports/{report_id}")
def read_report(dataset_id: str, report_id: str) -> dict[str, Any]:
    """Get a single report by ID.

    Args:
        dataset_id: Unique dataset identifier.
        report_id: Unique report identifier.

    Returns:
        Report metadata.
    """
    return get_report(report_id)


@router.get("/{dataset_id}/reports/{report_id}/download")
def download_report(dataset_id: str, report_id: str) -> FileResponse:
    """Download a generated PDF report.

    Args:
        dataset_id: Unique dataset identifier.
        report_id: Unique report identifier.

    Returns:
        PDF file response.
    """
    report = get_report(report_id)
    file_path = report.get("filePath")

    if not file_path:
        raise NotFoundError(f"Report file for '{report_id}' not found.")

    from pathlib import Path
    path = Path(file_path)
    if not path.exists():
        raise NotFoundError(f"Report file not found at: {file_path}")

    return FileResponse(
        path=file_path,
        filename=f"{report['title'].replace(' ', '_')}.pdf",
        media_type="application/pdf",
    )


@router.delete("/{dataset_id}/reports/{report_id}")
def remove_report(dataset_id: str, report_id: str) -> dict[str, str]:
    """Delete a report.

    Args:
        dataset_id: Unique dataset identifier.
        report_id: Unique report identifier.

    Returns:
        Success confirmation.
    """
    return delete_report(report_id)

