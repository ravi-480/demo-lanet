"use client";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { IEvent } from "@/Interface/interface";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { adjustEventBudget } from "@/store/eventSlice";
import { toast } from "sonner";

interface StatCardProps {
  title: string;
  value: number;
  percentage?: number;
  isOverBudget?: boolean;
  color?: string;
  isRemaining?: boolean;
}

const StatCard = ({
  title,
  value,
  percentage,
  color = "text-gray-200",
  isOverBudget,
  isRemaining,
}: StatCardProps) => {
  const formattedValue = Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);

  const valueTextClass = isOverBudget && isRemaining ? "text-red-500" : color;
  const percentageText =
    isRemaining && isOverBudget
      ? `${percentage}% over budget`
      : `${percentage}% of total budget`;

  return (
    <Card className="bg-gray-800 transition-colors">
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

const BudgetStats = ({ eventBudget }: { eventBudget: IEvent | null }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const dispatch = useDispatch<AppDispatch>();

  if (!eventBudget?.budget) return null;

  const totalBudget = Number(eventBudget.budget.allocated);
  const spent = Number(eventBudget.budget.spent);
  const remaining = totalBudget - spent;
  const isOverBudget = remaining < 0;

  const calculatePercentage = (amount: number) => {
    return totalBudget > 0
      ? Number(((amount / totalBudget) * 100).toFixed(1))
      : 0;
  };

  const handleBudgetAdjust = async () => {
    try {
      await dispatch(
        adjustEventBudget({ eventId: eventBudget._id, adjustAmount })
      ).unwrap();

      setIsDialogOpen(false);

      toast.success("Budget updated successfully!");
    } catch (error: unknown) {
      toast.error(` ${error} `);
    }
  };

  return (
    <div className="space-y-4">
      {isOverBudget && (
        <Alert
          variant="destructive"
          className="bg-red-50 flex items-center justify-between border-red-300 mb-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-medium">Budget Warning</AlertTitle>
            </div>
            <AlertDescription>
              You have exceeded your allocated budget by ₹{" "}
              {Math.abs(remaining).toFixed(2)}
            </AlertDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                className="border border-red-500 hover:text-red-600 cursor-pointer"
              >
                Adjust Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adjust Budget</DialogTitle>
                <DialogDescription>
                  Make changes to your Budget here. Click save when you&apos;re
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Adjust Amt :
                  </Label>
                  <Input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAdjustAmount(Number(e.target.value))
                    }
                    id="username"
                    type="number"
                    max={10000000}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleBudgetAdjust} type="button">
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <StatCard
          title="Total Budget"
          color="text-green-500"
          value={totalBudget}
        />
        <StatCard
          title="Spent"
          color="text-red-400"
          value={spent}
          percentage={calculatePercentage(spent)}
          isOverBudget={isOverBudget}
        />
        <StatCard
          title="Remaining"
          value={remaining}
          color="text-orange-500"
          percentage={calculatePercentage(Math.abs(remaining))}
          isOverBudget={isOverBudget}
          isRemaining={true}
        />
      </div>
    </div>
  );
};

export default BudgetStats;
