"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface Alert {
  message: string;
  type?: "success" | "error" | "info" | "warning";
}

interface AlertContextType {
  alert: Alert | null;
  showAlert: (message: string, type?: Alert["type"]) => void;
  clearAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<Alert | null>(null);

  const showAlert = (message: string, type: Alert["type"] = "info") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000); // Se borra automáticamente
  };

  const clearAlert = () => setAlert(null);

  return (
    <AlertContext.Provider value={{ alert, showAlert, clearAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlertContext = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlertContext must be used within AlertProvider");
  return context;
};
