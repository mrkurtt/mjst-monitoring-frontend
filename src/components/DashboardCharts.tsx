import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Label,
  Legend,
} from "recharts";

interface ChartProps {
  data: Array<{ name: string; value: number }>;
  chartType?: "RSD" | "STD";
  period?: "firstHalf" | "secondHalf";
  onBarClick?: (month: number, value: number) => void;
}

// Colors for Review Status Distribution and Submission Type Distribution
const RSD_COLORS = {
  "Pre-Review": "#f97316", // orange-500
  "Double-Blind": "#b45309", // amber-700
  Accepted: "#22c55e", // green-500
  Published: "#6366f1", // indigo-500
  Rejected: "#ef4444", // red-500
};

const STD_COLORS = {
  Upload: "#6B7280", // gray-500
  Published: "#6366F1", // indigo-500 (matching published card)
  Rejected: "#EF4444", // red-500 (matching rejected card)
};

const COLORS = ["#3B82F6", "#10B981", "#6366F1", "#4F46E5", "#EF4444", "#8B5CF6"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow">
        <p className="text-sm">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const BarChart: React.FC<ChartProps> = ({ data, period, onBarClick }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
        barSize={25}
        onClick={(data: any) => {
          if (onBarClick && data.activePayload) {
            const monthIndex =
              period === "firstHalf"
                ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].indexOf(data.activePayload[0].payload.name)
                : ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(data.activePayload[0].payload.name) + 6;
            onBarClick(monthIndex, data.activePayload[0].value);
          }
        }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} height={60} angle={0} textAnchor="middle" />
        <YAxis domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fontSize: 11 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="value"
          fill="#3B82F6"
          name={period === "firstHalf" ? "Jan-Jun Submissions" : "Jul-Dec Submissions"}
          animationDuration={1000}
          animationBegin={0}
          maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

interface PieChartProps {
  data: {
    name: string;
    value: number;
    color: string;
    percentage: number;
  }[];
  chartType: string;
  showPercentage?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ data, chartType, showPercentage = false }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <Label
            content={({ viewBox: { cx, cy } }) => (
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                Total
                <tspan x={cx} y={cy + 20}>
                  {data.reduce((sum, item) => sum + item.value, 0)}
                </tspan>
              </text>
            )}
          />
        </Pie>
        <Tooltip
          content={({ payload }) => {
            if (payload && payload[0]) {
              const data = payload[0].payload;
              return (
                <div className="bg-white p-2 border rounded shadow">
                  <p className="font-medium">{data.name}</p>
                  <p>Count: {data.value}</p>
                  {showPercentage && <p>Percentage: {data.percentage}%</p>}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend
          formatter={(value, entry: any) => (
            <span className="text-sm">
              {value} {showPercentage && `(${entry.payload.percentage}%)`}
            </span>
          )}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

const DashboardCharts = {
  BarChart,
  PieChart,
};

export default DashboardCharts;
