"use client";
import React from "react";
import Box from "@mui/material/Box";
import NavSidebar from "@/components/nav/NavSidebar";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", height: "100%", weight: "100%" }}>
      <NavSidebar />
      <div className="providerflow">
        <div className="reactflow-wrapper">{children}</div>
      </div>
    </Box>
  );
}
