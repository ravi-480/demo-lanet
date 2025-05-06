"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  CustomizedLabelProps,
  CustomTooltipProps,
  MyPieChartProps,
} from "../../../Interface/interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MyPieChart = ({ event, rsvpData }: MyPieChartProps) => {
  const { budget = { allocated: 0, spent: 0 } } = event;

  const remaining = budget.allocated - budget.spent;

  const budgetData = [
    { name: "Spent", value: budget.spent },
    { name: "Remaining", value: remaining > 0 ? remaining : 0 },
  ];

  const totalGuests = rsvpData?.length || 0;
  const confirmedGuests =
    rsvpData?.filter((guest) => guest.status === "Confirmed").length || 0;
  const pendingGuests =
    rsvpData?.filter((guest) => guest.status === "Pending").length || 0;
  const declinedGuests =
    rsvpData?.filter((guest) => guest.status === "Declined").length || 0;

  let guestData = [
    { name: "Confirmed", value: confirmedGuests },
    { name: "Pending", value: pendingGuests },
    { name: "Declined", value: declinedGuests },
  ].filter((item) => item.value > 0);

  if (guestData.length === 0) {
    guestData = [{ name: "No Responses", value: 1 }];
  }

  const BUDGET_COLORS = ["#FF6C6B", "#4ECDC4"];
  const GUEST_COLORS = ["#59A5D8", "#FFD166", "#EF476F", "#A0AEC0"]; // Last color for No Response

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const renderCustomizedLabel = (props: CustomizedLabelProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    if (percent < 0.05) return null;
    return (
      <text
        x={x}
        y={y}
        fill="#FFFFFF"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    console.log(active, payload);

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-2 border border-gray-700 rounded shadow-lg">
          <p className="font-bold text-gray-200">{data.name}</p>
          {data.name === "Spent" || data.name === "Remaining" ? (
            <p className="text-gray-300">
              {formatCurrency(data.value)} (
              {((data.value / budget.allocated) * 100).toFixed(1)}%)
            </p>
          ) : data.name === "No Responses" ? (
            <p className="text-gray-300">No guest responses yet</p>
          ) : (
            <p className="text-gray-300">
              {data.value} guests (
              {totalGuests > 0
                ? ((data.value / totalGuests) * 100).toFixed(1)
                : 0}
              %)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const budgetPercent = Number(
    ((budget.spent / budget.allocated) * 100).toFixed(1)
  );

  const guestLimitExceeded = totalGuests > event.guestLimit;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Budget Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-blue-400">Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={budgetData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={renderCustomizedLabel}
              >
                {budgetData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={BUDGET_COLORS[index % BUDGET_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                formatter={(value) => (
                  <span className="text-gray-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-sm text-gray-300">Total Budget</p>
              <p className="text-lg text-cyan-500 font-bold">
                {formatCurrency(budget.allocated)}
              </p>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-sm text-gray-300">Budget Utilized</p>
              <p
                className="text-lg font-bold"
                style={{
                  color:
                    budget.allocated > 0 && budgetPercent > 100
                      ? "#ef4444"
                      : budgetPercent >= 90
                      ? "#facc15"
                      : "#22d3ee",
                }}
              >
                {budgetPercent}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-blue-400">Guest Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={guestData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={renderCustomizedLabel}
              >
                {guestData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GUEST_COLORS[index % GUEST_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                formatter={(value) => (
                  <span className="text-gray-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-sm text-gray-300">Total Guests</p>
              <p
                className={`text-lg font-bold ${
                  guestLimitExceeded ? "text-red-500" : "text-cyan-500"
                }`}
              >
                {totalGuests} / {event.guestLimit}
              </p>
              {guestLimitExceeded && (
                <p className="text-xs text-red-400 mt-1">Limit exceeded</p>
              )}
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-sm text-gray-300">Response Rate</p>
              <p className="text-lg text-cyan-500 font-bold">
                {totalGuests > 0
                  ? ((confirmedGuests / totalGuests) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyPieChart;
