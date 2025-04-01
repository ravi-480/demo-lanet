import { BudgetProps } from "@/Interface/interface";
import React from "react";

const Budget: React.FC<BudgetProps> = ({
  totalBudget,
  totalSpent,
  remainingBudget,
  expenses,
  events,
  formatCurrency,
}) => {
  return (
    <div className="bg-blue-950 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-300 mb-4">Budget Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300">Total Budget</h3>
          <p className="text-2xl font-bold text-gray-400">
            {formatCurrency(totalBudget)}
          </p>
        </div>
        <div className="bg-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300">Total Spent</h3>
          <p className="text-2xl font-bold text-gray-400">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="bg-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-300">Remaining</h3>
          <p className="text-2xl font-bold text-gray-400">
            {formatCurrency(remainingBudget)}
          </p>
        </div>
      </div>

      <h3 className="text-md font-medium text-gray-300 mb-3">
        Recent Expenses
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Event
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Vendor
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-blue-900 divide-y divide-gray-200">
            {expenses.map((expense) => {
              const relatedEvent = events.find((e) => e.id === expense.eventId);
              return (
                <tr key={expense.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-200">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">
                    {relatedEvent?.name || "Unknown Event"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">
                    {expense.vendor}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">
                    {expense.category}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100 text-right">
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Budget;
