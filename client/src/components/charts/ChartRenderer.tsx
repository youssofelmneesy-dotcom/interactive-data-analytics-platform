/**
 * ChartRenderer — Recharts wrapper component.
 *
 * Renders interactive charts based on chart type and data.
 * Supports: bar, line, pie, histogram, scatter, box, heatmap.
 * Dark mode compatible via CSS variables.
 */

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Rectangle,
} from "recharts";
import type {
  ChartType,
  ChartDataPoint,
  AggregationType,
} from "@/types/chart";

interface ChartRendererProps {
  chartType: ChartType;
  data: ChartDataPoint[];
  xLabel: string;
  yLabel: string;
  aggregation: AggregationType;
  groupBy?: string | null;
  title?: string;
}

const COLORS = [
  "hsl(222, 47%, 40%)",
  "hsl(160, 60%, 35%)",
  "hsl(340, 70%, 45%)",
  "hsl(35, 90%, 45%)",
  "hsl(270, 50%, 45%)",
  "hsl(190, 70%, 40%)",
  "hsl(10, 75%, 50%)",
  "hsl(140, 55%, 35%)",
  "hsl(280, 60%, 50%)",
  "hsl(50, 85%, 45%)",
];

function getColor(index: number): string {
  return COLORS[index % COLORS.length];
}

export function ChartRenderer({
  chartType,
  data,
  xLabel,
  yLabel,
  groupBy,
  title: _title,
}: ChartRendererProps): JSX.Element {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        No data available for this chart configuration.
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    borderColor: "hsl(var(--border))",
    color: "hsl(var(--card-foreground))",
    borderRadius: "0.5rem",
    borderWidth: "1px",
    fontSize: "0.75rem",
  };

  const axisStyle = {
    fill: "hsl(var(--muted-foreground))",
    fontSize: 12,
  };

  const gridColor = "hsl(var(--border))";

  // ============================================================
  // BAR CHART
  // ============================================================
  if (chartType === "bar") {
    const seriesKeys = Object.keys(data[0]).filter(
      (k) => k !== xLabel && k !== "name"
    );

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 32, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey={xLabel}
            tick={axisStyle}
            angle={-45}
            textAnchor="end"
            height={60}
            label={{ value: xLabel, position: "insideBottom", offset: -10, style: axisStyle }}
          />
          <YAxis tick={axisStyle} label={{ value: yLabel, angle: -90, position: "insideLeft", style: axisStyle }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {seriesKeys.length > 0 ? (
            seriesKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={getColor(i)} radius={[4, 4, 0, 0]} />
            ))
          ) : (
            <Bar dataKey={yLabel} fill={getColor(0)} radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ============================================================
  // LINE CHART
  // ============================================================
  if (chartType === "line") {
    const seriesKeys = Object.keys(data[0]).filter(
      (k) => k !== xLabel && k !== "name"
    );

    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 32, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey={xLabel}
            tick={axisStyle}
            angle={-45}
            textAnchor="end"
            height={60}
            label={{ value: xLabel, position: "insideBottom", offset: -10, style: axisStyle }}
          />
          <YAxis tick={axisStyle} label={{ value: yLabel, angle: -90, position: "insideLeft", style: axisStyle }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {seriesKeys.length > 0 ? (
            seriesKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={getColor(i)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))
          ) : (
            <Line
              type="monotone"
              dataKey={yLabel}
              stroke={getColor(0)}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // ============================================================
  // PIE CHART
  // ============================================================
  if (chartType === "pie") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={getColor(index)} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  // ============================================================
  // HISTOGRAM
  // ============================================================
  if (chartType === "histogram") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 32, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="label"
            tick={axisStyle}
            angle={-45}
            textAnchor="end"
            height={60}
            label={{ value: "Bin Range", position: "insideBottom", offset: -10, style: axisStyle }}
          />
          <YAxis tick={axisStyle} label={{ value: "Count", angle: -90, position: "insideLeft", style: axisStyle }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" fill={getColor(0)} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ============================================================
  // SCATTER PLOT
  // ============================================================
  if (chartType === "scatter") {
    const categories = groupBy
      ? Array.from(new Set(data.map((d) => String(d.category || "default"))))
      : ["default"];

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 32, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            tick={axisStyle}
            label={{ value: xLabel, position: "insideBottom", offset: -10, style: axisStyle }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            tick={axisStyle}
            label={{ value: yLabel, angle: -90, position: "insideLeft", style: axisStyle }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={tooltipStyle}
            formatter={(value: number, name: string) => [value.toFixed(2), name]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {categories.map((cat, i) => (
            <Scatter
              key={cat}
              name={cat}
              data={data.filter((d) => (groupBy ? String(d.category) === cat : true))}
              fill={getColor(i)}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // ============================================================
  // BOX PLOT (custom rendering via BarChart)
  // ============================================================
  if (chartType === "box") {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 32, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            tick={axisStyle}
            angle={-45}
            textAnchor="end"
            height={60}
            label={{ value: xLabel || "Group", position: "insideBottom", offset: -10, style: axisStyle }}
          />
          <YAxis tick={axisStyle} label={{ value: yLabel, angle: -90, position: "insideLeft", style: axisStyle }} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, name: string) => {
              if (name === "q1ToMedian") return [value, "Q1 to Median"];
              if (name === "medianToQ3") return [value, "Median to Q3"];
              return [value, name];
            }}
          />
          {/* Whiskers rendered as error bars via custom shape is complex; use simplified bar representation */}
          <Bar dataKey="lowerWhisker" stackId="a" fill="transparent" />
          <Bar dataKey="q1" stackId="a" fill={getColor(0)} fillOpacity={0.3} />
          <Bar dataKey="median" stackId="a" fill={getColor(0)} />
          <Bar dataKey="q3" stackId="a" fill={getColor(0)} fillOpacity={0.3} />
          <Bar dataKey="upperWhisker" stackId="a" fill="transparent" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // ============================================================
  // HEATMAP (rendered as scatter with color intensity)
  // ============================================================
  if (chartType === "heatmap") {
    const values = data.map((d) => Number(d.value));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const heatmapData = data.map((d) => ({
      ...d,
      colorIntensity: (Number(d.value) - minVal) / range,
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 64, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            type="category"
            dataKey="x"
            tick={axisStyle}
            angle={-45}
            textAnchor="end"
            height={80}
            label={{ value: xLabel, position: "insideBottom", offset: -10, style: axisStyle }}
          />
          <YAxis
            type="category"
            dataKey="y"
            tick={axisStyle}
            width={80}
            label={{ value: yLabel, angle: -90, position: "insideLeft", style: axisStyle }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number, _name: string, props: { payload?: { x: string; y: string } }) => {
              const label = props?.payload ? `${props.payload.x} / ${props.payload.y}` : "";
              return [value.toFixed(2), label];
            }}
          />
          <Scatter data={heatmapData} shape={<HeatmapCell />}>
            {heatmapData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`hsl(222, ${30 + entry.colorIntensity * 50}%, ${30 + entry.colorIntensity * 40}%)`}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  // Fallback
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
      Unsupported chart type: {chartType}
    </div>
  );
}

// ============================================================
// HEATMAP CUSTOM CELL
// ============================================================

function HeatmapCell(props: {
  cx?: number;
  cy?: number;
  width?: number;
  height?: number;
  fill?: string;
}): JSX.Element {
  const { cx = 0, cy = 0, width = 0, height = 0, fill = "#8884d8" } = props;
  return (
    <Rectangle
      x={cx - width / 2}
      y={cy - height / 2}
      width={width}
      height={height}
      fill={fill}
      stroke="hsl(var(--background))"
      strokeWidth={1}
      rx={2}
    />
  );
}

