"""
Chart engine for data visualization.

Provides data aggregation, transformation, and formatting functions
to generate chart-ready data structures for various visualization types.
"""

from typing import Any

import pandas as pd
import numpy as np

from app.core.exceptions import BadRequestError


# ============================================================
# SUPPORTED CHART TYPES
# ============================================================

CHART_TYPES = {
    "bar",
    "line",
    "pie",
    "histogram",
    "scatter",
    "box",
    "heatmap",
}

# ============================================================
# SUPPORTED AGGREGATIONS
# ============================================================

AGGREGATIONS = {
    "sum": np.sum,
    "count": np.size,
    "mean": np.mean,
    "median": np.median,
    "min": np.min,
    "max": np.max,
    "std": np.std,
}


# ============================================================
# VALIDATION
# ============================================================

def validate_chart_request(
    df: pd.DataFrame,
    chart_type: str,
    x_axis: str | None,
    y_axis: str | None,
    aggregation: str,
) -> None:
    """
    Validate a chart request against the dataset schema.

    Args:
        df: Input DataFrame.
        chart_type: Requested chart type.
        x_axis: X-axis column name.
        y_axis: Y-axis column name.
        aggregation: Aggregation function name.

    Raises:
        BadRequestError: If any parameter is invalid.
    """
    if chart_type not in CHART_TYPES:
        raise BadRequestError(
            f"Unsupported chart type '{chart_type}'. "
            f"Supported: {', '.join(sorted(CHART_TYPES))}"
        )

    if aggregation not in AGGREGATIONS:
        raise BadRequestError(
            f"Unsupported aggregation '{aggregation}'. "
            f"Supported: {', '.join(sorted(AGGREGATIONS.keys()))}"
        )

    if x_axis is not None and x_axis not in df.columns:
        raise BadRequestError(f"X-axis column '{x_axis}' not found in dataset.")

    if y_axis is not None and y_axis not in df.columns:
        raise BadRequestError(f"Y-axis column '{y_axis}' not found in dataset.")

    # Chart-specific validation
    if chart_type in ("bar", "line", "pie") and y_axis is not None:
        if not pd.api.types.is_numeric_dtype(df[y_axis]):
            raise BadRequestError(
                f"Y-axis column '{y_axis}' must be numeric for {chart_type} charts."
            )

    if chart_type == "scatter" and y_axis is not None:
        if not pd.api.types.is_numeric_dtype(df[y_axis]):
            raise BadRequestError(
                f"Y-axis column '{y_axis}' must be numeric for scatter plots."
            )

    if chart_type == "histogram" and x_axis is not None:
        if not pd.api.types.is_numeric_dtype(df[x_axis]):
            raise BadRequestError(
                f"X-axis column '{x_axis}' must be numeric for histograms."
            )

    if chart_type == "heatmap":
        if x_axis is None or y_axis is None:
            raise BadRequestError("Heatmap requires both x-axis and y-axis columns.")
        if not pd.api.types.is_numeric_dtype(df[y_axis]):
            raise BadRequestError(
                f"Y-axis column '{y_axis}' must be numeric for heatmaps."
            )


# ============================================================
# DATA PREPARATION
# ============================================================

def apply_filters(df: pd.DataFrame, filters: list[dict[str, Any]] | None) -> pd.DataFrame:
    """
    Apply filter conditions to a DataFrame.

    Args:
        df: Input DataFrame.
        filters: List of filter dictionaries with keys: column, operator, value.

    Returns:
        Filtered DataFrame.
    """
    if not filters:
        return df

    result = df.copy()
    for f in filters:
        col = f.get("column")
        op = f.get("operator")
        val = f.get("value")

        if col not in result.columns:
            continue

        series = result[col]
        dtype = series.dtype

        # Try to cast value to column type
        try:
            if pd.api.types.is_numeric_dtype(dtype):
                val = pd.to_numeric(val)
            elif pd.api.types.is_datetime64_any_dtype(dtype):
                val = pd.to_datetime(val)
        except (ValueError, TypeError):
            pass

        if op == "eq":
            result = result[series == val]
        elif op == "ne":
            result = result[series != val]
        elif op == "gt":
            result = result[series > val]
        elif op == "gte":
            result = result[series >= val]
        elif op == "lt":
            result = result[series < val]
        elif op == "lte":
            result = result[series <= val]
        elif op == "contains":
            result = result[series.astype(str).str.contains(str(val), na=False)]
        elif op == "in":
            values = val if isinstance(val, list) else [val]
            result = result[series.isin(values)]

    return result.reset_index(drop=True)


def prepare_grouped_data(
    df: pd.DataFrame,
    x_axis: str,
    y_axis: str,
    aggregation: str,
    group_by: str | None = None,
) -> pd.DataFrame:
    """
    Aggregate data by x-axis with optional secondary grouping.

    Args:
        df: Input DataFrame.
        x_axis: Column to group by (X-axis).
        y_axis: Column to aggregate (Y-axis).
        aggregation: Aggregation function name.
        group_by: Optional secondary grouping column.

    Returns:
        Aggregated DataFrame.
    """
    agg_func = AGGREGATIONS[aggregation]

    if group_by and group_by in df.columns:
        grouped = df.groupby([x_axis, group_by], observed=True)[y_axis].agg(agg_func).reset_index()
        # Pivot for multi-series charts
        pivot = grouped.pivot(index=x_axis, columns=group_by, values=y_axis).reset_index()
        pivot.columns.name = None
        return pivot
    else:
        grouped = df.groupby(x_axis, observed=True)[y_axis].agg(agg_func).reset_index()
        return grouped


# ============================================================
# CHART DATA GENERATORS
# ============================================================

def generate_bar_chart_data(
    df: pd.DataFrame,
    x_axis: str,
    y_axis: str,
    aggregation: str,
    group_by: str | None = None,
) -> list[dict[str, Any]]:
    """
    Generate data for bar charts.

    Returns:
        List of data points with x, y, and optional series keys.
    """
    data = prepare_grouped_data(df, x_axis, y_axis, aggregation, group_by)
    return data.to_dict(orient="records")


def generate_line_chart_data(
    df: pd.DataFrame,
    x_axis: str,
    y_axis: str,
    aggregation: str,
    group_by: str | None = None,
) -> list[dict[str, Any]]:
    """
    Generate data for line charts.

    Returns:
        List of data points with x, y, and optional series keys.
    """
    # Sort by x-axis for line charts
    data = prepare_grouped_data(df, x_axis, y_axis, aggregation, group_by)

    # Try to sort if x-axis is numeric or datetime
    if pd.api.types.is_numeric_dtype(df[x_axis]) or pd.api.types.is_datetime64_any_dtype(df[x_axis]):
        data = data.sort_values(by=x_axis)

    return data.to_dict(orient="records")


def generate_pie_chart_data(
    df: pd.DataFrame,
    x_axis: str,
    y_axis: str,
    aggregation: str,
) -> list[dict[str, Any]]:
    """
    Generate data for pie charts.

    Returns:
        List of data points with name (category) and value.
    """
    grouped = df.groupby(x_axis, observed=True)[y_axis].agg(AGGREGATIONS[aggregation]).reset_index()
    grouped = grouped.sort_values(by=y_axis, ascending=False)

    # Limit to top 20 categories for readability
    if len(grouped) > 20:
        top = grouped.head(20)
        others_sum = grouped.iloc[20:][y_axis].sum()
        others_row = pd.DataFrame({x_axis: ["Others"], y_axis: [others_sum]})
        grouped = pd.concat([top, others_row], ignore_index=True)

    return [
        {"name": str(row[x_axis]), "value": float(row[y_axis])}
        for _, row in grouped.iterrows()
    ]


def generate_histogram_data(
    df: pd.DataFrame,
    x_axis: str,
    bins: int = 20,
) -> list[dict[str, Any]]:
    """
    Generate data for histograms.

    Args:
        df: Column to bin.
        bins: Number of bins.

    Returns:
        List of bins with range and count.
    """
    series = df[x_axis].dropna()
    if len(series) == 0:
        return []

    counts, edges = np.histogram(series, bins=bins)

    result = []
    for i in range(len(counts)):
        result.append({
            "binStart": round(float(edges[i]), 4),
            "binEnd": round(float(edges[i + 1]), 4),
            "count": int(counts[i]),
            "label": f"{round(float(edges[i]), 2)} – {round(float(edges[i + 1]), 2)}",
        })

    return result


def generate_scatter_data(
    df: pd.DataFrame,
    x_axis: str,
    y_axis: str,
    group_by: str | None = None,
) -> list[dict[str, Any]]:
    """
    Generate data for scatter plots.

    Returns:
        List of points with x, y, and optional category.
    """
    result = []
    for _, row in df.iterrows():
        point = {
            "x": _safe_numeric(row[x_axis]),
            "y": _safe_numeric(row[y_axis]),
        }
        if group_by and group_by in df.columns:
            point["category"] = str(row[group_by])
        result.append(point)

    return result


def generate_box_plot_data(
    df: pd.DataFrame,
    x_axis: str | None,
    y_axis: str,
) -> list[dict[str, Any]]:
    """
    Generate data for box plots.

    Args:
        x_axis: Optional categorical grouping column.
        y_axis: Numeric column to summarize.

    Returns:
        List of box plot statistics per group.
    """
    if x_axis and x_axis in df.columns:
        groups = df.groupby(x_axis, observed=True)[y_axis]
    else:
        groups = {y_axis: df[y_axis]}

    result = []
    for name, series in groups:
        clean = series.dropna()
        if len(clean) == 0:
            continue

        q1 = clean.quantile(0.25)
        q3 = clean.quantile(0.75)
        iqr = q3 - q1
        lower = max(clean.min(), q1 - 1.5 * iqr)
        upper = min(clean.max(), q3 + 1.5 * iqr)

        result.append({
            "name": str(name),
            "min": float(clean.min()),
            "q1": float(q1),
            "median": float(clean.median()),
            "q3": float(q3),
            "max": float(clean.max()),
            "mean": float(clean.mean()),
            "lowerWhisker": float(lower),
            "upperWhisker": float(upper),
            "outliers": [float(v) for v in clean[(clean < lower) | (clean > upper)].tolist()],
        })

    return result


def generate_heatmap_data(
    df: pd.DataFrame,
    x_axis: str,
    y_axis: str,
    aggregation: str,
) -> list[dict[str, Any]]:
    """
    Generate data for heatmaps (correlation or aggregated matrix).

    Args:
        x_axis: Row categorical column.
        y_axis: Column categorical column (aggregated values).

    Returns:
        List of heatmap cells with x, y, and value.
    """
    # For heatmap, y_axis is the value column, x_axis is the row category
    # We need a second categorical column for columns - use the most common categorical
    cat_cols = df.select_dtypes(include=["object", "category", "string"]).columns.tolist()
    cat_cols = [c for c in cat_cols if c != x_axis]

    if len(cat_cols) == 0:
        # Fallback: bin the y-axis numeric into categories
        df = df.copy()
        df["_binned"] = pd.cut(df[y_axis], bins=10).astype(str)
        pivot_col = "_binned"
    else:
        pivot_col = cat_cols[0]

    agg_func = AGGREGATIONS[aggregation]
    pivot = df.pivot_table(
        values=y_axis,
        index=x_axis,
        columns=pivot_col,
        aggfunc=agg_func,
        fill_value=0,
    )

    result = []
    for x_val in pivot.index:
        for y_val in pivot.columns:
            result.append({
                "x": str(x_val),
                "y": str(y_val),
                "value": float(pivot.loc[x_val, y_val]),
            })

    return result


# ============================================================
# MAIN CHART GENERATOR
# ============================================================

def generate_chart_data(
    df: pd.DataFrame,
    chart_type: str,
    x_axis: str | None,
    y_axis: str | None,
    aggregation: str = "count",
    group_by: str | None = None,
    filters: list[dict[str, Any]] | None = None,
    bins: int = 20,
) -> dict[str, Any]:
    """
    Generate complete chart data for any supported chart type.

    Args:
        df: Input DataFrame.
        chart_type: Type of chart to generate.
        x_axis: X-axis column name.
        y_axis: Y-axis column name.
        aggregation: Aggregation function.
        group_by: Secondary grouping column.
        filters: Optional filter conditions.
        bins: Number of bins for histograms.

    Returns:
        Dictionary with chart data and metadata.

    Raises:
        BadRequestError: If parameters are invalid.
    """
    validate_chart_request(df, chart_type, x_axis, y_axis, aggregation)

    filtered = apply_filters(df, filters)

    if chart_type == "bar":
        data = generate_bar_chart_data(filtered, x_axis, y_axis, aggregation, group_by)
    elif chart_type == "line":
        data = generate_line_chart_data(filtered, x_axis, y_axis, aggregation, group_by)
    elif chart_type == "pie":
        data = generate_pie_chart_data(filtered, x_axis, y_axis, aggregation)
    elif chart_type == "histogram":
        data = generate_histogram_data(filtered, x_axis, bins)
    elif chart_type == "scatter":
        data = generate_scatter_data(filtered, x_axis, y_axis, group_by)
    elif chart_type == "box":
        data = generate_box_plot_data(filtered, x_axis, y_axis)
    elif chart_type == "heatmap":
        data = generate_heatmap_data(filtered, x_axis, y_axis, aggregation)
    else:
        raise BadRequestError(f"Chart type '{chart_type}' not implemented.")

    return {
        "chartType": chart_type,
        "data": data,
        "config": {
            "title": f"{chart_type.title()} Chart",
            "xLabel": x_axis or "",
            "yLabel": y_axis or "",
            "aggregation": aggregation,
            "groupBy": group_by,
            "rowCount": len(filtered),
        },
    }


# ============================================================
# CHART RECOMMENDATIONS
# ============================================================

def recommend_charts(df: pd.DataFrame, max_recommendations: int = 6) -> list[dict[str, Any]]:
    """
    Automatically recommend chart configurations based on column types.

    Args:
        df: Input DataFrame.
        max_recommendations: Maximum number of recommendations.

    Returns:
        List of recommended chart configurations.
    """
    recommendations = []

    numeric_cols = [
        col for col in df.columns
        if pd.api.types.is_numeric_dtype(df[col])
    ]
    cat_cols = [
        col for col in df.columns
        if pd.api.types.is_string_dtype(df[col]) or pd.api.types.is_categorical_dtype(df[col])
    ]
    date_cols = [
        col for col in df.columns
        if pd.api.types.is_datetime64_any_dtype(df[col])
    ]

    # Bar chart: categorical vs numeric
    if cat_cols and numeric_cols:
        recommendations.append({
            "chartType": "bar",
            "xAxis": cat_cols[0],
            "yAxis": numeric_cols[0],
            "aggregation": "sum",
            "reason": f"Compare {numeric_cols[0]} across {cat_cols[0]} categories",
        })

    # Line chart: date vs numeric
    if date_cols and numeric_cols:
        recommendations.append({
            "chartType": "line",
            "xAxis": date_cols[0],
            "yAxis": numeric_cols[0],
            "aggregation": "mean",
            "reason": f"Trend of {numeric_cols[0]} over time",
        })

    # Pie chart: categorical distribution
    if cat_cols and numeric_cols:
        recommendations.append({
            "chartType": "pie",
            "xAxis": cat_cols[0],
            "yAxis": numeric_cols[0],
            "aggregation": "sum",
            "reason": f"Distribution of {numeric_cols[0]} by {cat_cols[0]}",
        })

    # Histogram: first numeric
    if numeric_cols:
        recommendations.append({
            "chartType": "histogram",
            "xAxis": numeric_cols[0],
            "yAxis": None,
            "aggregation": "count",
            "reason": f"Distribution of {numeric_cols[0]} values",
        })

    # Scatter: two numerics
    if len(numeric_cols) >= 2:
        recommendations.append({
            "chartType": "scatter",
            "xAxis": numeric_cols[0],
            "yAxis": numeric_cols[1],
            "aggregation": "count",
            "reason": f"Correlation between {numeric_cols[0]} and {numeric_cols[1]}",
        })

    # Box plot: categorical vs numeric
    if cat_cols and numeric_cols:
        recommendations.append({
            "chartType": "box",
            "xAxis": cat_cols[0],
            "yAxis": numeric_cols[0],
            "aggregation": "count",
            "reason": f"Distribution of {numeric_cols[0]} across {cat_cols[0]} groups",
        })

    # Heatmap: two categoricals vs numeric
    if len(cat_cols) >= 2 and numeric_cols:
        recommendations.append({
            "chartType": "heatmap",
            "xAxis": cat_cols[0],
            "yAxis": numeric_cols[0],
            "aggregation": "mean",
            "reason": f"Matrix view of {numeric_cols[0]} across categories",
        })

    return recommendations[:max_recommendations]


# ============================================================
# UTILITIES
# ============================================================

def _safe_numeric(value) -> float | None:
    """Safely convert a value to float for scatter plots."""
    try:
        return float(value) if pd.notna(value) else None
    except (TypeError, ValueError):
        return None
    
    