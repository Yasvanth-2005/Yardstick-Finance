"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorModal from "./ErrorModal";
import { useData } from "@/app/contexts/DataContext";

interface Transaction {
  _id?: string;
  amount: number;
  date: string;
  category: string;
}

interface Budget {
  category: string;
  amount: number;
  month: string;
}

export default function Insights() {
  const [insights, setInsights] = useState<string[]>([]);

  const {
    transactions,
    budgets,
    error,
    isErrorModalOpen,
    closeErrorModal,
    fetchData,
  } = useData();

  useEffect(() => {
    if (
      Array.isArray(transactions) &&
      Array.isArray(budgets) &&
      transactions.length > 0
    ) {
      generateInsights(transactions, budgets);
    }
  }, [transactions, budgets]);

  const generateInsights = (transactions: Transaction[], budgets: Budget[]) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const newInsights: string[] = [];

    // Safety check for valid transactions
    const validTransactions = transactions.filter(
      (t) => t && t.date && t.category && typeof t.amount === "number"
    );

    const categoryTotals = validTransactions
      .filter((t) => t.date && t.date.startsWith(currentMonth))
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const highSpending = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    if (highSpending.length > 0) {
      newInsights.push(
        `Your top spending categories this month are ${highSpending
          .map(([cat, amt]) => `${cat} (₹${amt.toFixed(2)})`)
          .join(" and ")}.`
      );
    }

    budgets
      .filter((b) => b.month === currentMonth)
      .forEach((b) => {
        const spent = validTransactions
          .filter(
            (t) =>
              t.category === b.category &&
              t.date &&
              t.date.startsWith(currentMonth)
          )
          .reduce((sum, t) => sum + t.amount, 0);

        if (spent > b.amount) {
          newInsights.push(
            `You've exceeded your ${b.category} budget by ₹${(
              spent - b.amount
            ).toFixed(2)}!`
          );
        }
      });

    setInsights(newInsights);
  };

  return (
    <>
      <ErrorModal
        open={isErrorModalOpen}
        onClose={closeErrorModal}
        onRetry={fetchData}
        error={error || "Unknown error occurred"}
        title="Insights Error"
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">
            Spending Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <p className="text-sm sm:text-base text-gray-600">
              No insights available yet. Add more transactions to see insights.
            </p>
          ) : (
            <ul className="list-disc pl-4 sm:pl-5 space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm sm:text-base text-gray-700">
                  {insight}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
