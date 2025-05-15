import { createContext, useContext } from "react";

type SidebarContextType = {
  isCollapsed: boolean | null;
  toggleSidebar: () => void;
};

export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar must be used within SidebarProvider");
  return context;
};
