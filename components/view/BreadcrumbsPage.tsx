"use client";

import "@/app/globals.css";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { Box, IconButton } from "@mui/material";

interface BreadcrumbsPageProps {
  breadcrumbs?: { name: string; href?: string }[];
  breadcrumbsBarElement?: React.ReactNode;
}

const BreadcrumbsPage: React.FC<
  React.PropsWithChildren<BreadcrumbsPageProps>
> = ({ breadcrumbs, breadcrumbsBarElement, children }) => {
  const router = useRouter();

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box
        style={{
          height: 57,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          paddingLeft: "8px",
          paddingRight: "16px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
          flexShrink: 0,
        }}
      >
        {breadcrumbs && (
          <IconButton
            disabled={breadcrumbs.length <= 1}
            onClick={() => router.back()}
            aria-label="Back"
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Breadcrumbs separator="›" aria-label="breadcrumb">
          {breadcrumbs?.map((breadcrumb, index) =>
            breadcrumb.href ? (
              <Link
                key={index}
                color="inherit"
                href={breadcrumb.href}
                underline="hover"
              >
                {breadcrumb.name}
              </Link>
            ) : (
              <Typography key={index} color="text.primary">
                {breadcrumb.name}
              </Typography>
            ),
          )}
        </Breadcrumbs>
        <Box
          style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}
        >
          {breadcrumbsBarElement}
        </Box>
      </Box>
      {children}
    </Box>
  );
};

export default BreadcrumbsPage;
