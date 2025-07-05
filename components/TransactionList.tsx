"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus, FileText } from "lucide-react";
import TransactionForm from "./TransactionForm";
import ErrorModal from "./ErrorModal";
import { useData } from "@/app/contexts/DataContext";
import { Toast } from "@/components/ui/toast";
import SearchBar from "./SearchBar";
import { Transaction } from "@/lib/types";

export default function TransactionList() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >();
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  const {
    transactions,
    categories,
    error,
    isErrorModalOpen,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    closeErrorModal,
    fetchData,
  } = useData();

  // Initialize filtered transactions with all transactions
  useEffect(() => {
    setFilteredTransactions(transactions);
  }, [transactions]);

  const handleAddOrUpdate = async (data: Transaction) => {
    try {
      if (data._id) {
        await updateTransaction(data);
        setToast({
          message: "Transaction updated successfully!",
          type: "success",
        });
      } else {
        await addTransaction(data);
        setToast({
          message: "Transaction added successfully!",
          type: "success",
        });
      }
      setIsFormOpen(false);
      setEditingTransaction(undefined);
    } catch (error) {
      setToast({
        message: "Failed to save transaction. Please try again.",
        type: "error",
      });
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;

    if (!confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await deleteTransaction(id);
      setToast({
        message: "Transaction deleted successfully!",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        message: err?.message || "Failed to delete transaction",
        type: "error",
      });
    }
  };

  const formatAmount = (amount: any): string => {
    if (amount === null || amount === undefined) return "₹0.00";
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return isNaN(numAmount) ? "₹0.00" : `₹${numAmount.toFixed(2)}`;
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  // Show toast for user feedback
  const showToast = toast && (
    <Toast
      message={toast.message}
      type={toast.type}
      duration={3000}
      onClose={() => setToast(null)}
    />
  );

  return (
    <div className="space-y-4">
      <ErrorModal
        open={isErrorModalOpen}
        onClose={closeErrorModal}
        onRetry={fetchData}
        error={error || "Unknown error occurred"}
        title="Transaction Error"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg sm:text-xl font-bold" id="transactions-heading">
          Transactions
        </h2>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="w-full sm:w-auto"
          aria-label="Add new transaction"
        >
          <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
          Add Transaction
        </Button>
      </div>

      {showToast}

      {/* Search and Filter Section */}
      <SearchBar
        transactions={transactions}
        onSearchChange={setFilteredTransactions}
        categories={categories}
      />

      {Array.isArray(filteredTransactions) &&
      filteredTransactions.length > 0 ? (
        <div
          className="overflow-x-auto rounded-lg border"
          role="region"
          aria-labelledby="transactions-heading"
        >
          <table
            className="w-full min-w-[600px] px-2"
            aria-label="Transactions table"
          >
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="text-left p-2 px-4 text-xs sm:text-sm font-medium"
                  scope="col"
                >
                  Date
                </th>
                <th
                  className="text-left p-2 text-xs sm:text-sm font-medium"
                  scope="col"
                >
                  Description
                </th>
                <th
                  className="text-left p-2 text-xs sm:text-sm font-medium"
                  scope="col"
                >
                  Category
                </th>
                <th
                  className="text-left p-2 text-xs sm:text-sm font-medium"
                  scope="col"
                >
                  Amount
                </th>
                <th
                  className="text-left p-2 text-xs sm:text-sm font-medium"
                  scope="col"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((t, index) => (
                <tr
                  key={t._id || `transaction-${index}`}
                  className="hover:bg-gray-50 focus-within:bg-blue-50"
                  data-transaction-id={t._id}
                >
                  <td className="p-2 px-4 text-xs sm:text-sm">
                    {new Date(t.date).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate">
                    {t.description}
                  </td>
                  <td className="p-2 text-xs sm:text-sm">{t.category}</td>
                  <td className="p-2 text-xs sm:text-sm font-medium">
                    {formatAmount(t.amount)}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(t)}
                        onKeyDown={(e) =>
                          handleKeyDown(e, () => handleEditClick(t))
                        }
                        className="h-8 w-8 p-0"
                        aria-label={`Edit transaction: ${t.description}`}
                        tabIndex={0}
                      >
                        <Edit
                          className="h-3 w-3 sm:h-4 sm:w-4"
                          aria-hidden="true"
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(t._id)}
                        onKeyDown={(e) =>
                          handleKeyDown(e, () => handleDelete(t._id))
                        }
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        aria-label={`Delete transaction: ${t.description}`}
                        tabIndex={0}
                      >
                        <Trash2
                          className="h-3 w-3 sm:h-4 sm:w-4"
                          aria-hidden="true"
                        />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
          role="status"
          aria-live="polite"
        >
          <FileText
            className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4"
            aria-hidden="true"
          />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {filteredTransactions.length === 0 && transactions.length > 0
              ? "No transactions match your search criteria"
              : "No Transactions Found"}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 px-4">
            {filteredTransactions.length === 0 && transactions.length > 0
              ? "Try adjusting your search filters to see more results."
              : "Start tracking your expenses by adding your first transaction."}
          </p>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto"
            aria-label="Add your first transaction"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            {filteredTransactions.length === 0 && transactions.length > 0
              ? "Add New Transaction"
              : "Add Your First Transaction"}
          </Button>
        </div>
      )}

      <TransactionForm
        transaction={editingTransaction}
        open={isFormOpen}
        onSubmit={handleAddOrUpdate}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(undefined);
        }}
      />
    </div>
  );
}
