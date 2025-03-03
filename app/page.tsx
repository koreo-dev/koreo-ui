"use client";

import { useState, useEffect, Fragment, useRef } from "react";
import useSWR from "swr";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Box,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import StyledLink from "@/components/StyledLink";
import "./globals.css";
import { Workflow, WorkflowParent, KubernetesObjectWithSpecAndStatus } from "@koreo/koreo-ts";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import yaml from "js-yaml";
import AppPage from "@/components/view/AppPage";
import { localizeTimestamp } from "@/utils/datetime";
import FilterInput, { FilterCriteria } from "@/components/FilterInput";
import { getResourceStatus } from "@/utils/status";
import BreadcrumbsPage from "@/components/view/BreadcrumbsPage";

// @ts-ignore
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

export default function Page() {
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
  const [workflows, setWorkflows] = useState<
    { workflow: Workflow; instances: number }[]
  >([]);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [workflowInstances, setWorkflowInstances] = useState<
    Record<string, { instance: WorkflowParent; managedResources: number }[]>
  >({});
  const [loadingInstances, setLoadingInstances] = useState<Set<string>>(
    new Set(),
  );
  const [filterInput, setFilterInput] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterCriteria[]>([]);
  const filterInputRef = useRef<HTMLInputElement>(null);

  // Instance YAML definition dialog
  const [selectedYaml, setSelectedYaml] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data: namespaces, isLoading: loadingNamespaces } = useSWR<string[]>(
    "/api/namespaces",
    fetcher,
    {
      refreshInterval: 60000,
    },
  );

  useEffect(() => {
    if (namespaces && namespaces.length > 0) {
      // Set the selected namespace from localStorage if there is one
      const savedNamespace = localStorage.getItem("selectedNamespace");
      if (savedNamespace !== null) {
        setSelectedNamespace(savedNamespace);
      } else {
        // Otherwise default to first namespace in the list
        setSelectedNamespace(namespaces[0]);
      }
    }
  }, [namespaces]);

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoadingWorkflows(true);
      try {
        const response = await fetch(
          `/api/koreo/${selectedNamespace}/workflows`,
        );
        if (!response.ok) throw new Error("Failed to fetch workflows");
        const data = await response.json();
        setWorkflows(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingWorkflows(false);
      }
    };

    if (selectedNamespace) {
      fetchWorkflows();
    }
  }, [selectedNamespace]);

  useEffect(() => {
    if (selectedNamespace) {
      localStorage.setItem("selectedNamespace", selectedNamespace);
    }
  }, [selectedNamespace]);

  const filteredWorkflows = workflows.filter((workflowWithInstances) => {
    const workflow = workflowWithInstances.workflow;
    if (activeFilters.length === 0) return true;

    return activeFilters.every((filter) => {
      const value = filter.value.toLowerCase();
      switch (filter.field) {
        case "":
          return (
            workflow.metadata?.name?.toLowerCase().includes(value) ||
            workflow.spec.crdRef?.apiGroup.toLowerCase().includes(value) ||
            workflow.spec.crdRef?.kind.toLowerCase().includes(value) ||
            workflow.spec.crdRef?.version.toLowerCase().includes(value)
          );
        case "name":
          return workflow.metadata?.name?.toLowerCase().includes(value);
        case "crdapigroup":
          return workflow.spec.crdRef?.apiGroup.toLowerCase().includes(value);
        case "crdkind":
          return workflow.spec.crdRef?.kind.toLowerCase().includes(value);
        case "crdversion":
          return workflow.spec.crdRef?.version.toLowerCase().includes(value);
        case "steps":
          return getWorkflowStepsCount(workflow).toString() == value;
        case "instances":
          return workflowWithInstances.instances.toString() == value;
        default:
          return true;
      }
    });
  });

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleHeaderClick = (field: string) => {
    setFilterInput(`${field}:`);
    filterInputRef.current?.focus();
  };

  // Fetch workflow instances when a workflow is expanded.
  const handleToggleRow = async (workflowId: string, instanceCount: number) => {
    if (instanceCount === 0) {
      return;
    }

    if (expandedRow === workflowId) {
      setExpandedRow(null);
      return;
    }

    // Set expanded row early so the loading spinner will appear while fetching
    // instances.
    setExpandedRow(workflowId);

    // If instances are not already loaded, fetch them.
    if (!workflowInstances[workflowId]) {
      setLoadingInstances((prev) => {
        const newSet = new Set(prev);
        newSet.add(workflowId);
        return newSet;
      });

      try {
        const response = await fetch(
          `/api/koreo/${selectedNamespace}/workflows/${workflowId}/instances`,
        );
        if (!response.ok) throw new Error("Failed to fetch instances");
        const instances = await response.json();

        setWorkflowInstances((prev) => ({ ...prev, [workflowId]: instances }));
      } catch (error) {
        console.error("Failed to fetch instances:", error);
      } finally {
        setLoadingInstances((prev) => {
          const newSet = new Set(prev);
          newSet.delete(workflowId);
          return newSet;
        });
      }
    }
  };

  // Function to open the modal
  const handleOpenYamlViewer = (crd: KubernetesObjectWithSpecAndStatus) => {
    // Delete noisy junk before rendering YAML.
    delete crd.metadata?.annotations;
    delete crd.metadata?.finalizers;
    delete crd.metadata?.managedFields;
    setSelectedYaml(yaml.dump(crd));
  };

  // Function to close the modal
  const handleCloseYamlViewer = () => {
    setSelectedYaml(null);
  };

  return (
    <BreadcrumbsPage>
      <AppPage
        icon={<RouteOutlinedIcon />}
        documentTitle="Workflows"
        heading="Workflows"
      >
        <Box sx={{ maxWidth: 300 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="namespace-selector-label">Namespace</InputLabel>
            <Select
              labelId="namespace-selector-label"
              value={selectedNamespace}
              label="Namespace"
              variant={"outlined"}
              disabled={loadingNamespaces}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              sx={{
                backgroundColor: "white",
              }}
            >
              {namespaces?.map((namespace) => (
                <MenuItem key={namespace} value={namespace}>
                  {namespace}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box mt={2}>
          {loadingNamespaces || loadingWorkflows ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : workflows.length > 0 ? (
            <>
              <FilterInput
                ref={filterInputRef}
                filterInput={filterInput}
                setFilterInput={setFilterInput}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                validFields={[
                  "name",
                  "crdApiGroup",
                  "crdKind",
                  "crdVersion",
                  "steps",
                  "instances",
                ]}
                placeholderExample="name:aws-environment"
              />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleHeaderClick("name")}
                      >
                        Name
                      </TableCell>
                      <TableCell
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleHeaderClick("crdApiGroup")}
                      >
                        CRD API Group
                      </TableCell>
                      <TableCell
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleHeaderClick("crdKind")}
                      >
                        CRD Kind
                      </TableCell>
                      <TableCell
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleHeaderClick("crdVersion")}
                      >
                        CRD Version
                      </TableCell>
                      <TableCell
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleHeaderClick("steps")}
                      >
                        Steps
                      </TableCell>
                      <TableCell
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleHeaderClick("instances")}
                      >
                        Instances
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredWorkflows
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((workflowWithInstances) => (
                        <Fragment
                          key={workflowWithInstances.workflow.metadata?.name}
                        >
                          <TableRow
                            key={workflowWithInstances.workflow.metadata?.name}
                            sx={{
                              textDecoration: "none",
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                                cursor:
                                  workflowWithInstances.instances > 0
                                    ? "pointer"
                                    : "default",
                              },
                            }}
                            onClick={() =>
                              handleToggleRow(
                                workflowWithInstances.workflow.metadata?.name ||
                                  "",
                                workflowWithInstances.instances || 0,
                              )
                            }
                          >
                            <TableCell>
                              <Box
                                component={StyledLink}
                                href={`/workflow/${selectedNamespace}/${workflowWithInstances.workflow.metadata?.name}`}
                                onClick={(event) => event.stopPropagation()}
                              >
                                {workflowWithInstances.workflow.metadata?.name}
                              </Box>
                            </TableCell>
                            <TableCell>
                              {workflowWithInstances.workflow.spec.crdRef
                                ?.apiGroup || "n/a"}
                            </TableCell>
                            <TableCell>
                              {workflowWithInstances.workflow.spec.crdRef
                                ?.kind || "n/a"}
                            </TableCell>
                            <TableCell>
                              {workflowWithInstances.workflow.spec.crdRef
                                ?.version || "n/a"}
                            </TableCell>
                            <TableCell>
                              {getWorkflowStepsCount(
                                workflowWithInstances.workflow,
                              )}
                            </TableCell>
                            <TableCell>
                              {workflowWithInstances.workflow.spec.crdRef
                                ? workflowWithInstances.instances
                                : "n/a"}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              style={{
                                paddingBottom: 0,
                                paddingTop: 0,
                                border: "none",
                              }}
                              colSpan={6}
                            >
                              <Collapse
                                in={
                                  expandedRow ===
                                  workflowWithInstances.workflow.metadata?.name
                                }
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box sx={{ marginTop: 1, marginBottom: 2 }}>
                                  {loadingInstances.has(
                                    workflowWithInstances.workflow.metadata
                                      ?.name || "",
                                  ) ? (
                                    <Box
                                      display="flex"
                                      justifyContent="center"
                                      alignItems="center"
                                    >
                                      <CircularProgress />
                                    </Box>
                                  ) : (
                                    <>
                                      <Typography
                                        variant="h6"
                                        gutterBottom
                                        component="div"
                                        sx={{ marginTop: 2 }}
                                      >
                                        Instances
                                      </Typography>
                                      <Table>
                                        <TableHead>
                                          <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Created</TableCell>
                                            <TableCell>Generation</TableCell>
                                            <TableCell>
                                              Managed Resources
                                            </TableCell>
                                            <TableCell>YAML</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {(
                                            workflowInstances[
                                              workflowWithInstances.workflow
                                                .metadata?.name || ""
                                            ] || []
                                          ).map(
                                            (instanceWithManagedResources) => (
                                              <TableRow
                                                key={
                                                  instanceWithManagedResources
                                                    .instance.metadata?.name
                                                }
                                              >
                                                <TableCell>
                                                  {getInstanceLink(
                                                    workflowWithInstances.workflow,
                                                    instanceWithManagedResources.instance,
                                                  )}
                                                </TableCell>
                                                <TableCell>
                                                  {getResourceStatus(
                                                    instanceWithManagedResources.instance,
                                                  )}
                                                </TableCell>
                                                <TableCell>
                                                  {localizeTimestamp(
                                                    instanceWithManagedResources
                                                      .instance.metadata
                                                      ?.creationTimestamp,
                                                  )}
                                                </TableCell>
                                                <TableCell>
                                                  {
                                                    instanceWithManagedResources
                                                      .instance.metadata
                                                      ?.generation
                                                  }
                                                </TableCell>
                                                <TableCell>
                                                  {
                                                    instanceWithManagedResources.managedResources
                                                  }
                                                </TableCell>
                                                <TableCell>
                                                  <Tooltip title="View Instance Definition">
                                                    <IconButton
                                                      onClick={() =>
                                                        handleOpenYamlViewer(
                                                          instanceWithManagedResources.instance,
                                                        )
                                                      }
                                                      size="small"
                                                    >
                                                      <CodeRoundedIcon />
                                                    </IconButton>
                                                  </Tooltip>
                                                </TableCell>
                                              </TableRow>
                                            ),
                                          )}
                                        </TableBody>
                                      </Table>
                                    </>
                                  )}
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </Fragment>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredWorkflows.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
                <Dialog
                  open={Boolean(selectedYaml)}
                  onClose={handleCloseYamlViewer}
                  fullWidth
                  maxWidth="md"
                >
                  <DialogTitle>Workflow Instance Definition</DialogTitle>
                  <DialogContent>
                    <SyntaxHighlighter
                      language="yaml"
                      style={a11yDark}
                      customStyle={{
                        backgroundColor: "#282331",
                        fontSize: "12px",
                        borderRadius: "5px",
                        padding: "10px",
                      }}
                    >
                      {selectedYaml || ""}
                    </SyntaxHighlighter>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseYamlViewer} color="primary">
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              </TableContainer>
            </>
          ) : selectedNamespace && !loadingWorkflows ? (
            <Typography>No workflows found for this namespace.</Typography>
          ) : null}
        </Box>
      </AppPage>
    </BreadcrumbsPage>
  );
}

const getInstanceLink = (
  workflow: Workflow,
  instance: WorkflowParent,
): JSX.Element => {
  if (!workflow.metadata?.namespace || !workflow.metadata.name) {
    return <>{instance.metadata.name}</>;
  }

  return (
    <Box
      component={StyledLink}
      href={`/workflow/${workflow.metadata.namespace}/${workflow.metadata.name}?instance=${instance.metadata.name}`}
      onClick={(event) => event.stopPropagation()}
    >
      {instance.metadata.name}
    </Box>
  );
};

const getWorkflowStepsCount = (workflow: Workflow): number => {
  return workflow.spec.configStep
    ? 1 + workflow.spec.steps.length
    : workflow.spec.steps.length;
};
