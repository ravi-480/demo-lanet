// components/GuestStatCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GuestStatCardProps = {
  title: string;
  count: number;
  total: number;
  color: string;
};

export const GuestStatCard = ({
  title,
  count,
  total,
  color,
}: GuestStatCardProps) => {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : "0";

  return (
    <Card className="bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{count}</div>
        {title !== "Total Guests" && (
          <p className="text-xs text-gray-300 mt-1">
            {percentage}% of total guests
          </p>
        )}
      </CardContent>
    </Card>
  );
};
