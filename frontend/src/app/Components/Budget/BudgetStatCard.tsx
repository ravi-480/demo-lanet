import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const BudgetStats = ({ eventBudget }: any) => {
  if (!eventBudget || !eventBudget.budget) {
    return null;
  }

  const totalBudget = Number(eventBudget?.budget?.allocated);
  const spent = Number(eventBudget?.budget.spent);
  const remaining = totalBudget - spent;
  const isOverBudget = remaining < 0;

  const calculatePercentage = (count: number) => {
    return totalBudget > 0
      ? Number(((count / totalBudget) * 100).toFixed(1))
      : 0;
  };

  return (
    <div className="space-y-4">
      {isOverBudget && (
        <Alert variant="destructive" className="bg-red-50 border-red-300 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-medium">Budget Warning</AlertTitle>
          <AlertDescription>
            You have exceeded your allocated budget by 
            {Math.abs(remaining).toFixed(2)}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <StatCard title="Total Budget" value={totalBudget} />
        <StatCard
          title="Spent"
          value={spent}
          percentage={calculatePercentage(spent)}
          isOverBudget={isOverBudget}
        />
        <StatCard
          title="Remaining"
          value={remaining}
          percentage={calculatePercentage(Math.abs(remaining))}
          isOverBudget={isOverBudget}
          isRemaining={true}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  percentage?: number;
  isOverBudget?: boolean;
  isRemaining?: boolean;
}

const StatCard = ({
  title,
  value,
  percentage,
  isOverBudget,
  isRemaining,
}: StatCardProps) => {
  const formattedValue = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

  const valueTextClass =
    isOverBudget && isRemaining ? "text-red-500" : "text-gray-200";

  const percentageText =
    isRemaining && isOverBudget
      ? `${percentage}% over budget`
      : `${percentage}% of total budget`;

  return (
    <Card className={`bg-gray-800 transition-colors`}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-300">
          {title}
        </CardTitle>
      </CardHeader>
      <div className={`text-2xl font-bold ${valueTextClass} px-4`}>
        {formattedValue}
      </div>
      {percentage !== undefined && (
        <p className="text-xs text-gray-300 px-4 pb-4 mt-1">{percentageText}</p>
      )}
    </Card>
  );
};

export default BudgetStats;
