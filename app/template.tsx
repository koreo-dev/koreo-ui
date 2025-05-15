"use client";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import NavSidebar from "@/components/nav/NavSidebar";
import { SidebarContext } from "@/context/sidebar-context";

const SIDEBAR_COLLAPSE_KEY = "koreo-sidebar-collapsed";

export default function Template({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    setIsCollapsed(stored === "true");
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const newVal = !prev;
      sessionStorage.setItem(SIDEBAR_COLLAPSE_KEY, newVal.toString());
      return newVal;
    });
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
        <NavSidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        <div className="providerflow">
          <div className="reactflow-wrapper">{children}</div>
        </div>
      </Box>
    </SidebarContext.Provider>
  );
}
