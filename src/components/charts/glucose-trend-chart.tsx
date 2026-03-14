"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate } from "@/lib/utils";

type Point = {
  recorded_at: string;
  value_mg_dl: number;
};

type GlucoseTrendChartProps = {
  data: Point[];
};

export function GlucoseTrendChart({ data }: GlucoseTrendChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#d7e1df" />
          <XAxis
            dataKey="recorded_at"
            tickFormatter={(value: string) => formatDate(value)}
            stroke="#6f7e7a"
            tick={{ fontSize: 12 }}
          />
          <YAxis stroke="#6f7e7a" tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) =>
              typeof value === "string" ? formatDate(value) : String(value ?? "")
            }
            formatter={(value) => [`${Number(value)} mg/dL`, "Glucose"]}
          />
          <Line
            type="monotone"
            dataKey="value_mg_dl"
            stroke="#0f766e"
            strokeWidth={3}
            dot={{ r: 3, fill: "#0f766e" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
