// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface Transaction {
  _id?: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}

export interface Budget {
  _id?: string;
  category: string;
  amount: number;
  month: string;
}

export interface Category {
  _id?: string;
  name: string;
  color?: string;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  amount?: number;
}

export interface MonthlyExpenseData {
  name: string;
  amount: number;
}

export interface BudgetVsActualData {
  category: string;
  Budget: number;
  Actual: number;
}

// State Types
export interface DataState {
  transactions: Transaction[];
  budgets: Budget[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  isErrorModalOpen: boolean;
  hasLoaded: boolean;
}

// Form Types
export interface TransactionFormData {
  amount: number;
  date: string;
  description: string;
  category: string;
}

export interface BudgetFormData {
  category: string;
  amount: number;
  month: string;
}

// Toast Types
export interface ToastMessage {
  message: string;
  type: "error" | "success" | "warning" | "info";
}

// Search and Filter Types
export interface SearchFilters {
  query: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  minAmount: number;
  maxAmount: number;
}
