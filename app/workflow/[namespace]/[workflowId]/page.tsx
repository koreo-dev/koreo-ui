"use client";

import "@/app/globals.css";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Panel } from "@xyflow/react";
import "@/app/globals.css";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Checkbox,
  FormControlLabel,
  Box,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { KubernetesObjectWithSpecAndStatus } from "@koreo/koreo-ts";
import GraphPage from "@/components/view/GraphPage";

// @ts-ignore
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

export default function Page({
  params,
}: {
  params: { namespace: string; workflowId: string };
}) {
  const [instances, setInstances] = useState<string[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string>("");
  const [expanded, setExpanded] = useState<boolean>(false);

  const router = useRouter();

  const { data: instancesData } = useSWR<
    { instance: KubernetesObjectWithSpecAndStatus; managedResources: number }[]
  >(
    `/api/koreo/${params.namespace}/workflows/${params.workflowId}/instances`,
    fetcher,
    {
      refreshInterval: 60000,
    },
  );

  useEffect(() => {
    if (instancesData) {
      setInstances(
        instancesData.map(
          (instanceWithManagedResources: any) =>
            instanceWithManagedResources.instance.metadata.name,
        ),
      );
    }
  }, [instancesData]);

  // Wait for the instances to load before checking or updating the query
  // string.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryInstance = urlParams.get("instance");
    const queryExpanded = urlParams.get("expanded") === "true";

    if (queryInstance && instances.length > 0) {
      if (instances.includes(queryInstance)) {
        setSelectedInstance(queryInstance);
      } else {
        setSelectedInstance("");
      }
    }

    setExpanded(queryExpanded);
  }, [instances]);

  // Update the URL query string when selectedInstance changes.
  useEffect(() => {
    if (instances.length === 0) {
      // Don't update the query string if instances are still loading.
      return;
    }

    const queryParams = new URLSearchParams(window.location.search);

    if (selectedInstance === "") {
      queryParams.delete("instance");
    } else {
      queryParams.set("instance", selectedInstance);
    }

    if (expanded) {
      queryParams.set("expanded", "true");
    } else {
      queryParams.delete("expanded");
    }

    router.replace(`${window.location.pathname}?${queryParams.toString()}`);
  }, [selectedInstance, expanded, instances, router]);

  const breadcrumbs = [
    {
      name: "Workflows",
      href: "/workflow",
    },
    {
      name: params.namespace,
    },
    {
      name: params.workflowId,
      href: selectedInstance
        ? `/workflow/${params.namespace}/${params.workflowId}`
        : undefined,
    },
  ];

  if (selectedInstance) {
    breadcrumbs.push({
      name: selectedInstance,
    });
  }

  let endpoint = `/api/koreo/${params.namespace}/workflows/${params.workflowId}/graph`;
  const queryParams = new URLSearchParams();
  if (selectedInstance) {
      queryParams.set("instance", selectedInstance);
  }
  queryParams.set("expanded", expanded.toString());
  endpoint += `?${queryParams.toString()}`;

  const stateKey = `workflow:${params.namespace}:${params.workflowId}:instance:${selectedInstance ? selectedInstance : "null"}`;

  return (
    <GraphPage
      documentTitle={
        selectedInstance
          ? `${params.workflowId} › ${selectedInstance}`
          : params.workflowId
      }
      heading={
        selectedInstance
          ? `${params.workflowId} › ${selectedInstance}`
          : params.workflowId
      }
      graphEndpoint={endpoint}
      stateKey={stateKey}
      breadcrumbs={breadcrumbs}
    >
      {instances.length > 0 && (
        <Panel key={"instance"} position={"top-left"}>
          <Box display="flex" alignItems="center" gap={2}>
          <FormControl sx={{ m: 1, minWidth: 240 }} size="small">
            <InputLabel id="instance-selector-label">Instance</InputLabel>
            <Select
              labelId="instance-selector-label"
              value={selectedInstance}
              label="Instance"
              variant={"outlined"}
              onChange={(e) => setSelectedInstance(e.target.value)}
              sx={{
                backgroundColor: "white",
              }}
              IconComponent={selectedInstance ? () => null : ArrowDropDownIcon}
            >
              {instances.map((instance) => (
                <MenuItem key={instance} value={instance}>
                  {instance}
                </MenuItem>
              ))}
            </Select>
            {selectedInstance && (
              <IconButton
                size="small"
                onClick={() => setSelectedInstance("")}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </FormControl>
          <FormControlLabel
            control={<Checkbox checked={expanded} onChange={(e) => setExpanded(e.target.checked)} />}
            label={
                <Box display="flex" alignItems="center" gap={1}>
                  Expanded
                  <Tooltip title="Expand nested nodes like RefSwitches and Sub-Workflows into their constituent nodes">
                    <HelpOutlineIcon fontSize="small" />
                  </Tooltip>
                </Box>
              } 
          />
          </Box>
        </Panel>
      )}
    </GraphPage>
  );
}
