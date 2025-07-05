"use client";

import { useState } from "react";
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
import { useData } from "@/app/contexts/DataContext";

interface Budget {
  category: string;
  amount: number;
  month: string;
}

interface BudgetFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Budget) => void;
}

export default function BudgetForm({
  open,
  onClose,
  onSubmit,
}: BudgetFormProps) {
  const [formData, setFormData] = useState<Budget>({
    category: "Other",
    amount: 0,
    month: new Date().toISOString().slice(0, 7),
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const { categories, error, isErrorModalOpen, closeErrorModal, fetchData } =
    useData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setValidationError(null);

    if (!formData.amount || !formData.category || !formData.month) {
      setValidationError("All fields are required");
      return;
    }

    if (formData.amount <= 0) {
      setValidationError("Amount must be positive");
      return;
    }

    onSubmit(formData);
    setFormData({
      category: "Other",
      amount: 0,
      month: new Date().toISOString().slice(0, 7),
    });
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
            <DialogTitle className="text-lg sm:text-xl">Set Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {validationError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{validationError}</p>
              </div>
            )}
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Budget Amount</label>
              <Input
                type="number"
                placeholder="Enter budget amount"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value),
                  })
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Input
                type="month"
                value={formData.month}
                onChange={(e) =>
                  setFormData({ ...formData, month: e.target.value })
                }
                className="w-full"
              />
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
              <Button type="submit" className="w-full sm:w-auto">
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
