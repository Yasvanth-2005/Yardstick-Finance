"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ErrorModal from "./ErrorModal";
import { Loading } from "@/components/ui/loading";
import { useData } from "@/app/contexts/DataContext";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

interface Transaction {
  _id: string;
  amount: number;
  date: string;
  category: string;
}

interface Budget {
  category: string;
  amount: number;
  month: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
  "#ffc658",
];

function ChartComponents({
  barChartData,
  pieChartData,
  budgetVsActual,
}: {
  barChartData: any[];
  pieChartData: any[];
  budgetVsActual: any[];
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
  } = require("recharts");

  return (
    <>
      {barChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              Monthly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <BarChart
                width={Math.min(600, window.innerWidth - 40)}
                height={300}
                data={barChartData}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </div>
          </CardContent>
        </Card>
      )}

      {pieChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <PieChart
                width={Math.min(400, window.innerWidth - 40)}
                height={300}
              >
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {pieChartData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </CardContent>
        </Card>
      )}

      {budgetVsActual.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              Budget vs Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <BarChart
                width={Math.min(600, window.innerWidth - 40)}
                height={300}
                data={budgetVsActual}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Budget" fill="#8884d8" />
                <Bar dataKey="Actual" fill="#82ca9d" />
              </BarChart>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

export default function Charts() {
  const {
    transactions,
    budgets,
    isLoading,
    error,
    isErrorModalOpen,
    closeErrorModal,
    fetchData,
  } = useData();

  const validTransactions = Array.isArray(transactions)
    ? transactions.filter(
        (t) => t && t.date && t.amount && typeof t.amount === "number"
      )
    : [];

  const monthlyData = validTransactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.entries(monthlyData).map(([name, amount]) => ({
    name,
    amount,
  }));

  const categoryData = validTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Sum all budgets for each category for the current month
  const budgetSums: Record<string, number> = {};
  if (Array.isArray(budgets)) {
    budgets
      .filter((b) => b.month === currentMonth)
      .forEach((b) => {
        budgetSums[b.category] = (budgetSums[b.category] || 0) + b.amount;
      });
  }

  const budgetVsActual = Object.entries(budgetSums).map(
    ([category, Budget]) => ({
      category,
      Budget,
      Actual: validTransactions
        .filter(
          (t) =>
            t.category === category && t.date && t.date.startsWith(currentMonth)
        )
        .reduce((sum, t) => sum + t.amount, 0),
    })
  );

  const hasTransactionData =
    Array.isArray(transactions) && transactions.length > 0;
  const hasBudgetData = Array.isArray(budgets) && budgets.length > 0;
  const hasChartData =
    barChartData.length > 0 ||
    pieChartData.length > 0 ||
    budgetVsActual.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              Loading Charts...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Loading size="md" className="h-64" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasChartData) {
    return (
      <div className="space-y-6">
        <ErrorModal
          open={isErrorModalOpen}
          onClose={closeErrorModal}
          onRetry={fetchData}
          error={error || "Unknown error occurred"}
          title="Chart Data Error"
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">
              Financial Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 sm:py-12">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="flex space-x-2 sm:space-x-4">
                  <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <PieChart className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                </div>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                No Data Available for Charts
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto px-4">
                {!hasTransactionData && !hasBudgetData
                  ? "Add some transactions and budgets to see beautiful charts and insights about your spending patterns."
                  : !hasTransactionData
                  ? "Add some transactions to see spending trends and category breakdowns."
                  : "Add some budgets to compare your planned vs actual spending."}
              </p>
              <Button
                onClick={fetchData}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ErrorModal
        open={isErrorModalOpen}
        onClose={closeErrorModal}
        onRetry={fetchData}
        error={error || "Unknown error occurred"}
        title="Chart Data Error"
      />
      <ChartComponents
        barChartData={barChartData}
        pieChartData={pieChartData}
        budgetVsActual={budgetVsActual}
      />
    </div>
  );
}
