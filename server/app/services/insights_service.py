"""
AI Insights service for generating intelligent data analysis.

Integrates with Google Gemini API to produce:
- Natural language summaries
- Anomaly detection
- Correlation analysis
- Trend detection
- Outlier identification
"""

import json
import uuid
from datetime import datetime, timezone
from typing import Any

import pandas as pd
import numpy as np

from app.core.config import settings
from app.core.exceptions import BadRequestError, InternalServerError
from app.db.database import db_session
from app.services.dataset_service import get_dataset_dataframe, get_dataset

# ============================================================
# GEMINI API CLIENT
# ============================================================

def _get_gemini_client():
    """Lazy-load the Gemini API client."""
    try:
        import google.generativeai as genai
        if not settings.gemini_api_key:
            raise BadRequestError("Gemini API key not configured.")
        genai.configure(api_key=settings.gemini_api_key)
        return genai.GenerativeModel("gemini-1.5-flash")
    except ImportError:
        raise InternalServerError("Google Generative AI package not installed.")
    except Exception as exc:
        raise InternalServerError(f"Failed to initialize Gemini client: {exc}") from exc


# ============================================================
# PROMPT BUILDERS
# ============================================================

def _build_summary_prompt(df: pd.DataFrame, stats: list[dict[str, Any]]) -> str:
    """Build a prompt for dataset summary generation."""
    rows, cols = df.shape
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(include=["object", "category", "string"]).columns.tolist()

    prompt = f"""You are a senior data analyst. Provide a concise, professional summary of the following dataset.

Dataset Overview:
- Rows: {rows:,}
- Columns: {cols}
- Numeric columns: {numeric_cols}
- Categorical columns: {cat_cols}

Column Statistics:
{json.dumps(stats[:10], indent=2, default=str)}

Please provide:
1. A 2-3 sentence overview of what this dataset contains
2. Key observations about data distribution and quality
3. Notable patterns or characteristics
4. Potential use cases for this data

Keep the response concise and actionable. Use professional but accessible language."""
    return prompt


def _build_anomaly_prompt(df: pd.DataFrame, column: str | None = None) -> str:
    """Build a prompt for anomaly detection."""
    if column and column in df.columns:
        series = df[column].dropna()
        desc = series.describe().to_dict()
        data_sample = series.head(50).tolist()
        target = f"column '{column}'"
    else:
        numeric_df = df.select_dtypes(include=[np.number])
        desc = numeric_df.describe().to_dict()
        data_sample = numeric_df.head(20).to_dict(orient="records")
        target = "all numeric columns"

    prompt = f"""You are a data quality expert. Analyze the following data for anomalies, outliers, and data quality issues.

Target: {target}

Descriptive Statistics:
{json.dumps(desc, indent=2, default=str)}

Sample Data:
{json.dumps(data_sample, indent=2, default=str)}

Please identify:
1. Any statistical outliers or extreme values
2. Potential data entry errors or inconsistencies
3. Unusual distributions or skewness
4. Missing value patterns
5. Recommendations for data cleaning

Format your response as a structured analysis with severity levels (low/medium/high)."""
    return prompt


def _build_correlation_prompt(df: pd.DataFrame) -> str:
    """Build a prompt for correlation analysis."""
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.shape[1] < 2:
        return ""

    corr_matrix = numeric_df.corr().round(3).to_dict()
    prompt = f"""You are a statistical analyst. Analyze the correlation matrix below and identify meaningful relationships.

Correlation Matrix:
{json.dumps(corr_matrix, indent=2)}

Please provide:
1. The strongest positive and negative correlations
2. Any surprising or counterintuitive relationships
3. Potential multicollinearity issues
4. Actionable insights based on correlations
5. Recommendations for further analysis

Be specific about which variables are involved and the practical significance."""
    return prompt


def _build_trend_prompt(df: pd.DataFrame, date_column: str | None = None) -> str:
    """Build a prompt for trend detection."""
    if date_column and date_column in df.columns:
        df_copy = df.copy()
        df_copy[date_column] = pd.to_datetime(df_copy[date_column], errors="coerce")
        df_copy = df_copy.dropna(subset=[date_column])
        time_info = {
            "date_range": f"{df_copy[date_column].min()} to {df_copy[date_column].max()}",
            "records": len(df_copy),
        }
    else:
        time_info = {"note": "No explicit date column provided. Analyzing sequential trends."}

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    prompt = f"""You are a trend analyst. Identify trends and patterns in the following dataset.

Time/Sequence Information:
{json.dumps(time_info, indent=2, default=str)}

Numeric Columns: {numeric_cols}

First 20 rows:
{df.head(20).to_json(orient="records", date_format="iso")}

Please identify:
1. Overall trends (increasing, decreasing, cyclical, stationary)
2. Seasonal patterns if applicable
3. Growth rates or change points
4. Forecast implications
5. Business recommendations based on trends

Focus on actionable business insights."""
    return prompt


# ============================================================
# INSIGHT GENERATORS
# ============================================================

def generate_summary_insight(dataset_id: str) -> dict[str, Any]:
    """Generate a natural language summary of the dataset."""
    df = get_dataset_dataframe(dataset_id)
    from app.engines.statistics_engine import compute_all_stats
    stats = compute_all_stats(df)

    model = _get_gemini_client()
    prompt = _build_summary_prompt(df, stats)

    try:
        response = model.generate_content(prompt)
        description = response.text.strip()
    except Exception as exc:
        raise InternalServerError(f"Gemini API error: {exc}") from exc

    insight_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    with db_session() as conn:
        conn.execute(
            """
            INSERT INTO insights (id, dataset_id, title, description, severity)
            VALUES (?, ?, ?, ?, ?)
            """,
            (insight_id, dataset_id, "Dataset Summary", description, "info"),
        )

    return {
        "id": insight_id,
        "datasetId": dataset_id,
        "type": "summary",
        "title": "Dataset Summary",
        "description": description,
        "confidence": 0.95,
        "severity": "low",
        "createdAt": created_at,
    }


def generate_anomaly_insights(dataset_id: str, column: str | None = None) -> list[dict[str, Any]]:
    """Generate anomaly detection insights."""
    df = get_dataset_dataframe(dataset_id)

    model = _get_gemini_client()
    prompt = _build_anomaly_prompt(df, column)

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
    except Exception as exc:
        raise InternalServerError(f"Gemini API error: {exc}") from exc

    # Parse the response into structured insights
    insights = []
    created_at = datetime.now(timezone.utc).isoformat()

    # Split response into sections and create individual insights
    sections = [s.strip() for s in text.split("\n\n") if s.strip()]
    for i, section in enumerate(sections[:5]):
        insight_id = str(uuid.uuid4())
        severity = "medium"
        if "high" in section.lower() or "critical" in section.lower() or "severe" in section.lower():
            severity = "high"
        elif "low" in section.lower() or "minor" in section.lower():
            severity = "low"

        with db_session() as conn:
            conn.execute(
                """
                INSERT INTO insights (id, dataset_id, title, description, severity)
                VALUES (?, ?, ?, ?, ?)
                """,
                (insight_id, dataset_id, f"Anomaly Detection {i+1}", section, severity),
            )

        insights.append({
            "id": insight_id,
            "datasetId": dataset_id,
            "type": "anomaly",
            "title": f"Anomaly Detection {i+1}",
            "description": section,
            "confidence": 0.85,
            "severity": severity,
            "relatedColumns": [column] if column else None,
            "createdAt": created_at,
        })

    return insights


def generate_correlation_insights(dataset_id: str) -> list[dict[str, Any]]:
    """Generate correlation analysis insights."""
    df = get_dataset_dataframe(dataset_id)
    numeric_df = df.select_dtypes(include=[np.number])

    if numeric_df.shape[1] < 2:
        return []

    model = _get_gemini_client()
    prompt = _build_correlation_prompt(df)

    if not prompt:
        return []

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
    except Exception as exc:
        raise InternalServerError(f"Gemini API error: {exc}") from exc

    insights = []
    created_at = datetime.now(timezone.utc).isoformat()

    sections = [s.strip() for s in text.split("\n\n") if s.strip()]
    for i, section in enumerate(sections[:5]):
        insight_id = str(uuid.uuid4())

        with db_session() as conn:
            conn.execute(
                """
                INSERT INTO insights (id, dataset_id, title, description, severity)
                VALUES (?, ?, ?, ?, ?)
                """,
                (insight_id, dataset_id, f"Correlation Analysis {i+1}", section, "info"),
            )

        insights.append({
            "id": insight_id,
            "datasetId": dataset_id,
            "type": "correlation",
            "title": f"Correlation Analysis {i+1}",
            "description": section,
            "confidence": 0.80,
            "severity": "low",
            "createdAt": created_at,
        })

    return insights


def generate_trend_insights(dataset_id: str, date_column: str | None = None) -> list[dict[str, Any]]:
    """Generate trend detection insights."""
    df = get_dataset_dataframe(dataset_id)

    # Auto-detect date column if not specified
    if not date_column:
        date_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()
        if date_cols:
            date_column = date_cols[0]
        else:
            # Try to convert object columns to datetime
            for col in df.select_dtypes(include=["object"]).columns:
                try:
                    pd.to_datetime(df[col], errors="raise")
                    date_column = col
                    break
                except (ValueError, TypeError):
                    continue

    model = _get_gemini_client()
    prompt = _build_trend_prompt(df, date_column)

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
    except Exception as exc:
        raise InternalServerError(f"Gemini API error: {exc}") from exc

    insights = []
    created_at = datetime.now(timezone.utc).isoformat()

    sections = [s.strip() for s in text.split("\n\n") if s.strip()]
    for i, section in enumerate(sections[:5]):
        insight_id = str(uuid.uuid4())

        with db_session() as conn:
            conn.execute(
                """
                INSERT INTO insights (id, dataset_id, title, description, severity)
                VALUES (?, ?, ?, ?, ?)
                """,
                (insight_id, dataset_id, f"Trend Analysis {i+1}", section, "info"),
            )

        insights.append({
            "id": insight_id,
            "datasetId": dataset_id,
            "type": "trend",
            "title": f"Trend Analysis {i+1}",
            "description": section,
            "confidence": 0.82,
            "severity": "low",
            "relatedColumns": [date_column] if date_column else None,
            "createdAt": created_at,
        })

    return insights


def generate_outlier_insights(dataset_id: str) -> list[dict[str, Any]]:
    """Generate outlier detection insights using statistical methods + AI."""
    df = get_dataset_dataframe(dataset_id)
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    if not numeric_cols:
        return []

    # Statistical outlier detection using IQR
    outlier_findings = []
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) < 10:
            continue
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        outliers = series[(series < lower) | (series > upper)]
        if len(outliers) > 0:
            outlier_findings.append({
                "column": col,
                "count": len(outliers),
                "percentage": round(len(outliers) / len(series) * 100, 2),
                "bounds": {"lower": float(lower), "upper": float(upper)},
                "extreme_values": outliers.nsmallest(3).tolist() + outliers.nlargest(3).tolist(),
            })

    if not outlier_findings:
        return []

    # Use Gemini to interpret the statistical findings
    model = _get_gemini_client()
    prompt = f"""You are a data quality expert. Interpret the following statistical outlier findings and provide actionable insights.

Outlier Findings:
{json.dumps(outlier_findings, indent=2, default=str)}

Please provide:
1. Interpretation of why these outliers might exist
2. Whether they represent data errors or genuine extreme values
3. Recommendations for handling each outlier case
4. Impact on analysis if outliers are removed vs. kept

Format as structured insights with severity levels."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
    except Exception as exc:
        raise InternalServerError(f"Gemini API error: {exc}") from exc

    insights = []
    created_at = datetime.now(timezone.utc).isoformat()

    sections = [s.strip() for s in text.split("\n\n") if s.strip()]
    for i, section in enumerate(sections[:5]):
        insight_id = str(uuid.uuid4())
        severity = "medium"
        if "high" in section.lower() or "critical" in section.lower():
            severity = "high"

        with db_session() as conn:
            conn.execute(
                """
                INSERT INTO insights (id, dataset_id, title, description, severity)
                VALUES (?, ?, ?, ?, ?)
                """,
                (insight_id, dataset_id, f"Outlier Analysis {i+1}", section, severity),
            )

        insights.append({
            "id": insight_id,
            "datasetId": dataset_id,
            "type": "outlier",
            "title": f"Outlier Analysis {i+1}",
            "description": section,
            "confidence": 0.88,
            "severity": severity,
            "relatedColumns": [f["column"] for f in outlier_findings],
            "metadata": {"outlierFindings": outlier_findings},
            "createdAt": created_at,
        })

    return insights


# ============================================================
# BULK & RETRIEVAL
# ============================================================

def generate_all_insights(dataset_id: str, types: list[str] | None = None) -> list[dict[str, Any]]:
    """Generate all requested types of insights for a dataset."""
    all_insights = []
    requested_types = types or ["summary", "anomaly", "correlation", "trend", "outlier"]

    if "summary" in requested_types:
        all_insights.append(generate_summary_insight(dataset_id))

    if "anomaly" in requested_types:
        all_insights.extend(generate_anomaly_insights(dataset_id))

    if "correlation" in requested_types:
        all_insights.extend(generate_correlation_insights(dataset_id))

    if "trend" in requested_types:
        all_insights.extend(generate_trend_insights(dataset_id))

    if "outlier" in requested_types:
        all_insights.extend(generate_outlier_insights(dataset_id))

    return all_insights


def list_insights(dataset_id: str) -> list[dict[str, Any]]:
    """Retrieve all stored insights for a dataset."""
    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT id, dataset_id, title, description, severity, created_at
            FROM insights
            WHERE dataset_id = ?
            ORDER BY created_at DESC
            """,
            (dataset_id,),
        ).fetchall()

    return [
        {
            "id": row["id"],
            "datasetId": row["dataset_id"],
            "type": _infer_insight_type(row["title"]),
            "title": row["title"],
            "description": row["description"],
            "severity": row["severity"],
            "createdAt": row["created_at"],
        }
        for row in rows
    ]


def get_insight(insight_id: str) -> dict[str, Any]:
    """Retrieve a single insight by ID."""
    with db_session() as conn:
        row = conn.execute(
            "SELECT id, dataset_id, title, description, severity, created_at FROM insights WHERE id = ?",
            (insight_id,),
        ).fetchone()

    if row is None:
        from app.core.exceptions import NotFoundError
        raise NotFoundError(f"Insight '{insight_id}' not found.")

    return {
        "id": row["id"],
        "datasetId": row["dataset_id"],
        "type": _infer_insight_type(row["title"]),
        "title": row["title"],
        "description": row["description"],
        "severity": row["severity"],
        "createdAt": row["created_at"],
    }


def delete_insight(insight_id: str) -> dict[str, str]:
    """Delete an insight."""
    with db_session() as conn:
        cursor = conn.execute("DELETE FROM insights WHERE id = ?", (insight_id,))
        if cursor.rowcount == 0:
            from app.core.exceptions import NotFoundError
            raise NotFoundError(f"Insight '{insight_id}' not found.")

    return {"message": "Insight deleted successfully."}


def _infer_insight_type(title: str) -> str:
    """Infer insight type from title."""
    title_lower = title.lower()
    if "summary" in title_lower:
        return "summary"
    if "anomaly" in title_lower:
        return "anomaly"
    if "correlation" in title_lower:
        return "correlation"
    if "trend" in title_lower:
        return "trend"
    if "outlier" in title_lower:
        return "outlier"
    return "summary"

