"use client";

import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CollectionStats } from "@/features/collection/collection-types";

const CHART_COLORS = ["#76f2b3", "#8bd8ff", "#f6c76b", "#ff7f6e", "#ff2f92", "#a7a29a"];

export function AnalyticsDashboard({ stats }: { stats: CollectionStats }) {
  if (!stats.recordCount && !stats.totalItems) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {stats.growthByMonth.length > 1 && (
        <Card className="border-cyan/10 bg-black/45">
          <CardHeader>
            <CardTitle className="text-sm text-white">Collection growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={stats.growthByMonth}>
                <XAxis dataKey="month" stroke="#a7a29a" fontSize={11} />
                <YAxis stroke="#a7a29a" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "#10110f",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#76f2b3"
                  strokeWidth={2}
                  dot={{ fill: "#76f2b3", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {stats.genreDistribution.length > 0 && (
        <Card className="border-emerald/10 bg-black/45">
          <CardHeader>
            <CardTitle className="text-sm text-white">Style distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.genreDistribution}
                  dataKey="count"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                >
                  {stats.genreDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#10110f",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {stats.topAlbums.length > 0 && (
        <Card className="border-amber/10 bg-black/45 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm text-white">Most valuable albums</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.topAlbums} layout="vertical">
                <XAxis type="number" stroke="#a7a29a" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="title"
                  stroke="#a7a29a"
                  fontSize={11}
                  width={120}
                />
                <Tooltip
                  formatter={(value) => [`$${Math.round(Number(value) / 100)}`, "Value"]}
                  contentStyle={{
                    background: "#10110f",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="valueCents" fill="#76f2b3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {stats.averageYear && (
        <Card className="border-fuchsia/10 bg-black/45">
          <CardContent className="p-4">
            <p className="text-caption text-zinc-400">Average release year</p>
            <p className="mt-1 text-3xl font-semibold text-white">{stats.averageYear}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
