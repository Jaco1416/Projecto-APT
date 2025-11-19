import { useAlertContext } from "@/context/AlertContext";

export const useAlert = () => {
  const { showAlert, clearAlert } = useAlertContext();
  return { showAlert, clearAlert };
};
