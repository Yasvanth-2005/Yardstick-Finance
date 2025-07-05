"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TransactionList from "./TransactionList";
import Charts from "./Charts";
import BudgetForm from "./BudgetForm";
import Insights from "./Insights";
import { Button } from "@/components/ui/button";
import ErrorModal from "./ErrorModal";
import { Loading } from "@/components/ui/loading";
import { AmountDisplay } from "@/components/ui/amount-display";
import { useData } from "@/app/contexts/DataContext";

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  category: string;
  description: string;
}

interface Budget {
  category: string;
  amount: number;
  month: string;
}

export default function Dashboard() {
  const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);

  const {
    transactions,
    budgets,
    isLoading,
    error,
    isErrorModalOpen,
    fetchData,
    addBudget,
    closeErrorModal,
  } = useData();

  const handleAddBudget = async (data: Budget) => {
    await addBudget(data);
    setIsBudgetFormOpen(false);
  };

  const validTransactions = Array.isArray(transactions)
    ? transactions.filter((t) => t && t.amount && typeof t.amount === "number")
    : [];

  const totalExpenses = validTransactions.reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = validTransactions.slice(0, 5);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const categoryBreakdown = validTransactions
    .filter((t) => t.date && t.date.startsWith(currentMonth))
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <Loading size="lg" text="Loading your financial data..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      <ErrorModal
        open={isErrorModalOpen}
        onClose={closeErrorModal}
        onRetry={fetchData}
        error={error || "Unknown error occurred"}
        title="Dashboard Error"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AmountDisplay
              amount={totalExpenses}
              className="text-xl sm:text-2xl font-bold"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(categoryBreakdown).length > 0 ? (
              <div className="space-y-1">
                {Object.entries(categoryBreakdown).map(([category, amount]) => (
                  <p key={category} className="text-xs sm:text-sm">
                    {category}: <AmountDisplay amount={amount} />
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">
                No transactions this month
              </p>
            )}
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-1">
                {recentTransactions.map((t) => (
                  <p key={t._id} className="text-xs sm:text-sm truncate">
                    {t.description}: <AmountDisplay amount={t.amount} />
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">
                No recent transactions
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <TransactionList />

      <div className="flex justify-center w-full sm:justify-end">
        <Button
          onClick={() => setIsBudgetFormOpen(true)}
          className="w-full sm:w-auto"
        >
          Set Budget
        </Button>
      </div>
      <Charts />
      <Insights />
      <BudgetForm
        open={isBudgetFormOpen}
        onClose={() => setIsBudgetFormOpen(false)}
        onSubmit={handleAddBudget}
      />
    </div>
  );
}
