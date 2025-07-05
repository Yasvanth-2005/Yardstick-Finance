"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ErrorModal from "./ErrorModal";
import { Loading } from "@/components/ui/loading";
import { useData } from "@/app/contexts/DataContext";

interface Transaction {
  _id?: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: Transaction) => void;
  onClose: () => void;
  open: boolean;
}

export default function TransactionForm({
  transaction,
  onSubmit,
  onClose,
  open,
}: TransactionFormProps) {
  const [formData, setFormData] = useState<Transaction>({
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "Other",
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const errorTimeout = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);

  const { categories, error, isErrorModalOpen, closeErrorModal, fetchData } =
    useData();

  const [original, setOriginal] = useState<Transaction | undefined>(undefined);

  useEffect(() => {
    if (open) {
      if (transaction) {
        const newFormData = {
          _id: transaction._id,
          amount:
            typeof transaction.amount === "string"
              ? parseFloat(transaction.amount)
              : Number(transaction.amount) || 0,
          date: transaction.date
            ? new Date(transaction.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          description: transaction.description || "",
          category: transaction.category || "Other",
        };
        setFormData(newFormData);
        setOriginal(newFormData);
      } else {
        const newFormData = {
          amount: 0,
          date: new Date().toISOString().split("T")[0],
          description: "",
          category: "Other",
        };
        setFormData(newFormData);
        setOriginal(undefined);
      }
    }
  }, [transaction, open]);

  // Auto-close validation error after 3 seconds
  useEffect(() => {
    if (validationError) {
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
      errorTimeout.current = setTimeout(() => setValidationError(null), 3000);
    }
    return () => {
      if (errorTimeout.current) clearTimeout(errorTimeout.current);
    };
  }, [validationError]);

  // Helper to check if form is dirty
  const isDirty = () => {
    if (!original) return true;
    return (
      formData.amount !== original.amount ||
      formData.date !== original.date ||
      formData.description !== original.description ||
      formData.category !== original.category
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (
      !formData.amount ||
      !formData.date ||
      !formData.description ||
      !formData.category
    ) {
      setValidationError("All fields are required");
      return;
    }
    if (formData.amount <= 0) {
      setValidationError("Amount must be positive");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        description: "",
        category: "Other",
      });
      setLoading(false);
      onClose();
    } catch (err: any) {
      setValidationError(err?.message || "Failed to save transaction");
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorModal
        open={isErrorModalOpen}
        onClose={closeErrorModal}
        onRetry={fetchData}
        error={error || "Unknown error occurred"}
        title="Category Error"
      />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {transaction ? "Edit Transaction" : "Add Transaction"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{validationError}</p>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center"
                disabled={!isDirty() || loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loading size="sm" className="mr-2" />
                    Saving...
                  </span>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
