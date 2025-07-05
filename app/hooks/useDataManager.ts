"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Transaction, Budget, DataState } from "@/lib/types";

export function useDataManager() {
  const isFetchingRef = useRef(false);

  // Helper function to validate ObjectId format
  const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  const [state, setState] = useState<DataState>({
    transactions: [],
    budgets: [],
    categories: [],
    isLoading: true,
    error: null,
    isErrorModalOpen: false,
    hasLoaded: false,
  });

  const fetchData = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) {
      return;
    }

    // Only fetch if we haven't loaded data yet
    if (state.hasLoaded && state.transactions.length > 0) {
      return;
    }

    isFetchingRef.current = true;
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const [transactionsRes, budgetsRes, categoriesRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/budgets"),
        fetch("/api/categories"),
      ]);

      const has500Error =
        transactionsRes.status === 500 ||
        budgetsRes.status === 500 ||
        categoriesRes.status === 500;

      if (has500Error) {
        throw new Error(
          "Internet connection appears to be down. Please check your connection and try again."
        );
      }

      const failedAPIs = [];
      if (!transactionsRes.ok) failedAPIs.push("transactions");
      if (!budgetsRes.ok) failedAPIs.push("budgets");
      if (!categoriesRes.ok) failedAPIs.push("categories");

      if (failedAPIs.length > 0) {
        if (failedAPIs.length === 3) {
          throw new Error(
            "All services are currently unavailable. Please try again later."
          );
        } else {
          throw new Error(
            `Failed to load ${failedAPIs.join(
              ", "
            )}. Some data may be unavailable.`
          );
        }
      }

      const [transactionsData, budgetsData, categoriesData] = await Promise.all(
        [transactionsRes.json(), budgetsRes.json(), categoriesRes.json()]
      );

      if (!Array.isArray(transactionsData)) {
        throw new Error("Invalid transactions data received from server");
      }
      if (!Array.isArray(budgetsData)) {
        throw new Error("Invalid budgets data received from server");
      }
      if (!Array.isArray(categoriesData)) {
        throw new Error("Invalid categories data received from server");
      }

      setState({
        transactions: transactionsData,
        budgets: budgetsData,
        categories: categoriesData,
        isLoading: false,
        error: null,
        isErrorModalOpen: false,
        hasLoaded: true,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load data";
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        isErrorModalOpen: true,
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, [state.hasLoaded, state.transactions.length]);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    // Optimistic update - add to local state immediately
    const newTransaction = {
      ...transaction,
      _id: `temp-${Date.now()}`, // Temporary ID for optimistic update
    };

    setState((prev) => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction],
    }));

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });

      if (!res.ok) throw new Error("Failed to save transaction");

      const savedTransaction = await res.json();

      // Update with the real data from server
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.map((t) =>
          t._id === newTransaction._id ? savedTransaction : t
        ),
      }));
    } catch (err) {
      // Revert optimistic update on error
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.filter(
          (t) => t._id !== newTransaction._id
        ),
        error:
          err instanceof Error ? err.message : "Failed to save transaction",
        isErrorModalOpen: true,
      }));
    }
  }, []);

  const updateTransaction = useCallback(
    async (transaction: Transaction) => {
      if (!transaction._id) return;
      const isTemporaryId = transaction._id.startsWith("temp-");

      if (isTemporaryId) {
        setState((prev) => ({
          ...prev,
          error:
            "Cannot edit a transaction that hasn't been saved yet. Please save the transaction first.",
          isErrorModalOpen: true,
        }));
        return;
      }

      if (!isValidObjectId(transaction._id)) {
        setState((prev) => ({
          ...prev,
          error:
            "Invalid transaction ID format. Please refresh the page and try again.",
          isErrorModalOpen: true,
        }));
        return;
      }

      const originalTransaction = state.transactions.find(
        (t) => t._id === transaction._id
      );

      setState((prev) => {
        const updatedTransactions = prev.transactions.map((t) =>
          t._id === transaction._id ? transaction : t
        );
        return {
          ...prev,
          transactions: updatedTransactions,
        };
      });

      try {
        const transactionToSend = {
          ...transaction,
          date: new Date(transaction.date).toISOString(),
        };

        const res = await fetch("/api/transactions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionToSend),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to update transaction");
        }

        // The server returns { message: "Transaction updated" }, not the updated transaction
        // So we keep the optimistic update as the final state
        // If we need the exact server data, we could fetch the updated transaction separately
      } catch (err) {
        // Revert optimistic update on error
        if (originalTransaction) {
          setState((prev) => ({
            ...prev,
            transactions: prev.transactions.map((t) =>
              t._id === transaction._id ? originalTransaction : t
            ),
            error:
              err instanceof Error
                ? err.message
                : "Failed to update transaction",
            isErrorModalOpen: true,
          }));
        }
      }
    },
    [state.transactions]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      // Store original transaction for rollback
      const originalTransaction = state.transactions.find((t) => t._id === id);

      // Optimistic update - remove from local state immediately
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((t) => t._id !== id),
      }));

      try {
        const res = await fetch("/api/transactions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) throw new Error("Failed to delete transaction");

        // Success - transaction already removed from state
      } catch (err) {
        // Revert optimistic update on error
        if (originalTransaction) {
          setState((prev) => ({
            ...prev,
            transactions: [...prev.transactions, originalTransaction],
            error:
              err instanceof Error
                ? err.message
                : "Failed to delete transaction",
            isErrorModalOpen: true,
          }));
        }
      }
    },
    [state.transactions]
  );

  const addBudget = useCallback(async (budget: Budget) => {
    // Optimistic update - add to local state immediately
    const newBudget = {
      ...budget,
      _id: `temp-budget-${Date.now()}`, // Temporary ID for optimistic update
    };

    setState((prev) => ({
      ...prev,
      budgets: [...prev.budgets, newBudget],
    }));

    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });

      if (!res.ok) throw new Error("Failed to save budget");

      const savedBudget = await res.json();

      // Update with the real data from server
      setState((prev) => ({
        ...prev,
        budgets: prev.budgets.map((b) =>
          b._id === newBudget._id ? savedBudget : b
        ),
      }));
    } catch (err) {
      // Revert optimistic update on error
      setState((prev) => ({
        ...prev,
        budgets: prev.budgets.filter((b) => b._id !== newBudget._id),
        error: err instanceof Error ? err.message : "Failed to save budget",
        isErrorModalOpen: true,
      }));
    }
  }, []);

  const closeErrorModal = useCallback(() => {
    setState((prev) => ({ ...prev, isErrorModalOpen: false }));
  }, []);

  useEffect(() => {
    // Only fetch on initial load
    if (!state.hasLoaded && !isFetchingRef.current) {
      fetchData();
    }
  }, [fetchData, state.hasLoaded]);

  return {
    ...state,
    fetchData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    closeErrorModal,
  };
}
