"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { IEvent } from "../../../Interface/interface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MyPieChartProps = {
  event: IEvent;
};

const MyPieChart = ({ event }: MyPieChartProps) => {
  const { budget = { allocated: 0, spent: 0 } } = event;
  const remaining = budget.allocated - budget.spent;

  // Create budget data for pie chart
  const budgetData = [
    { name: "Spent", value: budget.spent },
    { name: "Remaining", value: remaining > 0 ? remaining : 0 },
  ];

  // Create guest data for pie chart
  const guestData = [
    { name: "Confirmed", value: event.rsvp.confirmed },
    { name: "Pending", value: event.rsvp.total - event.rsvp.confirmed },
  ];

  // Colors for pie charts with better contrast
  const BUDGET_COLORS = ["#FF6C6B", "#4ECDC4"];
  const GUEST_COLORS = ["#59A5D8", "#FFD166"];

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  // Custom label renderer for better readability
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } =
      props;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    if (percent < 0.05) return null; // Don't show labels for tiny slices

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

  // Custom tooltip to show both percentage and actual values
  const CustomTooltip = ({ active, payload }: any) => {
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
          ) : (
            <p className="text-gray-300">
              {data.value} guests (
              {((data.value / event.rsvp.total) * 100).toFixed(1)}%)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                formatter={(value, entry, index) => (
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
              <p className="text-lg text-cyan-500 font-bold">
                {budget.allocated > 0
                  ? ((budget.spent / budget.allocated) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
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
                formatter={(value, entry, index) => (
                  <span className="text-gray-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-sm text-gray-300">Total Invited</p>
              <p className="text-lg text-cyan-500 font-bold">
                {event.rsvp.total}
              </p>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <p className="text-sm text-gray-300">Response Rate</p>
              <p className="text-lg text-cyan-500 font-bold">
                {event.rsvp.total > 0
                  ? ((event.rsvp.confirmed / event.rsvp.total) * 100).toFixed(1)
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
