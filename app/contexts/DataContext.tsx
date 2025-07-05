"use client";

import React, { createContext, useContext } from "react";
import { useDataManager } from "../hooks/useDataManager";

const DataContext = createContext<ReturnType<typeof useDataManager> | null>(
  null
);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const dataManager = useDataManager();

  return (
    <DataContext.Provider value={dataManager}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
