"use client";

import useSWR from "swr";
import BreadcrumbsPage from "@/components/view/BreadcrumbsPage";
import AppPage from "@/components/view/AppPage";
import FunctionsOutlinedIcon from "@mui/icons-material/FunctionsOutlined";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import yaml from "js-yaml";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import { Box, Typography, Grid } from "@mui/material";
import { localizeTimestamp, getLastModifiedTime } from "@/utils/datetime";
import theme from "@/app/theme";
import { Function } from "@koreo/koreo-ts";
import { useSearchParams } from "next/navigation";

// @ts-ignore
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

export default function Page({
  params,
}: {
  params: { namespace: string; functionId: string };
}) {
  const searchParams = useSearchParams();
  const kind = searchParams.get("kind") || "ResourceFunction";

  const { data: func, isLoading } = useSWR<Function>(
    `/api/koreo/${params.namespace}/functions/${params.functionId}?kind=${kind}`,
    fetcher,
  );

  const breadcrumbs = [
    {
      name: "Functions",
      href: "/function",
    },
    {
      name: params.namespace,
    },
    {
      name: params.functionId,
    },
  ];

  return (
    <BreadcrumbsPage breadcrumbs={breadcrumbs}>
      <AppPage
        heading={
          <>
            {params.functionId}
            {func && (
              <Chip
                label={func.kind}
                color="primary"
                variant="outlined"
                sx={{ marginLeft: 2 }}
              />
            )}
          </>
        }
        documentTitle={params.functionId}
        icon=<FunctionsOutlinedIcon />
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
                    {localizeTimestamp(func?.metadata?.creationTimestamp)}
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
                    {localizeTimestamp(getLastModifiedTime(func))}
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
              {yaml.dump(func?.spec)}
            </SyntaxHighlighter>
          </>
        )}
      </AppPage>
    </BreadcrumbsPage>
  );
}
