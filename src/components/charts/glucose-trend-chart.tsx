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
          <CartesianGrid strokeDasharray="4 4" stroke="#d7e8e4" />
          <XAxis
            dataKey="recorded_at"
            tickFormatter={(value: string) => formatDate(value)}
            stroke="#62817b"
            tick={{ fontSize: 12 }}
          />
          <YAxis stroke="#62817b" tick={{ fontSize: 12 }} />
          <Tooltip
            labelFormatter={(value) =>
              typeof value === "string" ? formatDate(value) : String(value ?? "")
            }
            formatter={(value) => [`${Number(value)} mg/dL`, "Glucose"]}
            contentStyle={{
              borderRadius: "0.9rem",
              border: "1px solid rgba(15, 118, 110, 0.2)",
              boxShadow: "0 20px 40px -28px rgba(15, 118, 110, 0.85)",
            }}
          />
          <Line
            type="monotone"
            dataKey="value_mg_dl"
            stroke="#0f766e"
            strokeWidth={3}
            dot={{ r: 3, fill: "#0f766e", stroke: "#ffffff", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#0d5f58" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
