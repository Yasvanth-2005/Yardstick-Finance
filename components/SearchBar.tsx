"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Transaction } from "@/lib/types";

interface SearchBarProps {
  transactions: Transaction[];
  onSearchChange: (filteredTransactions: Transaction[]) => void;
  categories: string[];
}

export default function SearchBar({
  transactions,
  onSearchChange,
  categories,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filterTransactions = useCallback(() => {
    let filtered = [...transactions];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (transaction) =>
          transaction.description.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query) ||
          transaction.amount.toString().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.category === selectedCategory
      );
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(
        (transaction) => new Date(transaction.date) >= new Date(dateFrom)
      );
    }

    if (dateTo) {
      filtered = filtered.filter(
        (transaction) => new Date(transaction.date) <= new Date(dateTo)
      );
    }

    onSearchChange(filtered);
  }, [
    searchQuery,
    selectedCategory,
    dateFrom,
    dateTo,
    transactions,
    onSearchChange,
  ]);

  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setDateFrom("");
    setDateTo("");
    onSearchChange(transactions);
  }, [transactions, onSearchChange]);

  // Apply filters when any filter changes
  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search transactions by description, category, or amount"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters Button */}
        {(searchQuery || selectedCategory !== "all" || dateFrom || dateTo) && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            aria-label="Clear all filters"
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Date Range Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label
            htmlFor="dateFrom"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            From Date
          </label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Filter transactions from this date"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="dateTo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            To Date
          </label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Filter transactions to this date"
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory !== "all" || dateFrom || dateTo) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {searchQuery && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Search: {searchQuery}
            </span>
          )}
          {selectedCategory !== "all" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Category: {selectedCategory}
            </span>
          )}
          {dateFrom && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              From: {dateFrom}
            </span>
          )}
          {dateTo && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              To: {dateTo}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
