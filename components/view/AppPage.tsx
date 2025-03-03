"use client";

import React, { useEffect } from "react";
import { Container, Typography, Box, SvgIconProps } from "@mui/material";
import "@/app/globals.css";

type AppPageProps = {
  icon?: React.ReactElement<SvgIconProps>;
  heading: React.ReactNode | string;
  documentTitle: string;
};

const AppPage: React.FC<React.PropsWithChildren<AppPageProps>> = ({
  icon,
  heading,
  documentTitle,
  children,
}) => {
  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);

  const styledIcon = icon ? (
    React.cloneElement(icon, {
      sx: { marginRight: 1, fontSize: "2.5rem", ...(icon.props.sx || {}) },
    })
  ) : (
    <></>
  );
  return (
    <Container maxWidth={false} sx={{ height: "100%", pt: 4 }}>
      <Box px={2} sx={{ height: "100%" }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          {styledIcon}
          {heading}
        </Typography>
        {children}
      </Box>
    </Container>
  );
};

export default AppPage;
