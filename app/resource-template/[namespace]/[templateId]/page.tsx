"use client";

import useSWR from "swr";
import BreadcrumbsPage from "@/components/view/BreadcrumbsPage";
import AppPage from "@/components/view/AppPage";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import yaml from "js-yaml";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import { Box, Typography, Grid } from "@mui/material";
import { localizeTimestamp, getLastModifiedTime } from "@/utils/datetime";
import theme from "@/app/theme";
import { ResourceTemplate } from "@koreo/koreo-ts";

// @ts-ignore
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

export default function Page({
  params,
}: {
  params: { namespace: string; templateId: string };
}) {
  const { data: template, isLoading } = useSWR<ResourceTemplate>(
    `/api/koreo/${params.namespace}/resource-templates/${params.templateId}`,
    fetcher,
  );

  const breadcrumbs = [
    {
      name: "Resource Templates",
      href: "/resource-template",
    },
    {
      name: params.namespace,
    },
    {
      name: params.templateId,
    },
  ];

  return (
    <BreadcrumbsPage breadcrumbs={breadcrumbs}>
      <AppPage
        heading={
          <>
            {params.templateId}
            {template && (
              <Chip
                label={template.spec.template.kind}
                color="primary"
                variant="outlined"
                sx={{ marginLeft: 2 }}
              />
            )}
          </>
        }
        documentTitle={params.templateId}
        icon=<ConstructionOutlinedIcon />
      >
        {isLoading ? (
          <>
            <Skeleton
              variant="rectangular"
              sx={{
                bgcolor: theme.palette.grey.A100,
                width: "100%",
                height: 108,
                borderRadius: "8px",
                mb: 2,
              }}
            />
            <Skeleton
              variant="rectangular"
              sx={{
                bgcolor: theme.palette.grey.A100,
                width: "100%",
                height: 300,
                borderRadius: "8px",
              }}
            />
          </>
        ) : (
          <>
            <Box
              sx={{
                bgcolor: theme.palette.grey.A100,
                p: 2,
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Grid container spacing={1}>
                <Grid item xs={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    fontWeight="bold"
                  >
                    Created:
                  </Typography>
                </Grid>
                <Grid item xs={10}>
                  <Typography variant="body2" color="textSecondary">
                    {localizeTimestamp(template?.metadata?.creationTimestamp)}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    fontWeight="bold"
                  >
                    Last Modified:
                  </Typography>
                </Grid>
                <Grid item xs={10}>
                  <Typography variant="body2" color="textSecondary">
                    {localizeTimestamp(getLastModifiedTime(template))}
                  </Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    fontWeight="bold"
                  >
                    Namespace:
                  </Typography>
                </Grid>
                <Grid item xs={10}>
                  <Typography variant="body2" color="textSecondary">
                    {params.namespace}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <SyntaxHighlighter
              language="yaml"
              style={a11yDark}
              customStyle={{
                backgroundColor: "#282331",
                fontSize: "12px",
                width: "100%",
                overflow: "auto",
                margin: 0,
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              {yaml.dump(template?.spec.template)}
            </SyntaxHighlighter>
          </>
        )}
      </AppPage>
    </BreadcrumbsPage>
  );
}
