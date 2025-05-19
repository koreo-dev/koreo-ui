"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  IconButton,
  OutlinedInput,
  Chip,
  SelectChangeEvent,
} from "@mui/material";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import StyledLink from "@/components/StyledLink";
import "../globals.css";
import AppPage from "@/components/view/AppPage";
import { localizeTimestamp, getLastModifiedTime } from "@/utils/datetime";
import FilterInput, { FilterCriteria } from "@/components/FilterInput";
import { ResourceTemplate } from "@koreo/koreo-ts";
import BreadcrumbsPage from "@/components/view/BreadcrumbsPage";
import RefreshIcon from "@mui/icons-material/Refresh";

// @ts-ignore
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

export default function Page() {
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [resourceTemplates, setResourceTemplates] = useState<
    ResourceTemplate[]
  >([]);
  const [loadingResourceTemplates, setLoadingResourceTemplates] =
    useState(false);
  const [filterInput, setFilterInput] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterCriteria[]>([]);
  const filterInputRef = useRef<HTMLInputElement>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    data: namespaces,
    isLoading: loadingNamespaces,
    mutate: refetchNamespaces,
  } = useSWR<string[]>("/api/namespaces", fetcher, {
    refreshInterval: 60000,
  });

  useEffect(() => {
    if (namespaces && namespaces.length > 0) {
      // Set the selected namespaces from localStorage if there are any
      const savedNamespaces = localStorage.getItem("selectedNamespaces");
      if (savedNamespaces !== null) {
        try {
          const parsedNamespaces = JSON.parse(savedNamespaces);
          setSelectedNamespaces(
            Array.isArray(parsedNamespaces)
              ? parsedNamespaces
              : [parsedNamespaces],
          );
        } catch (e) {
          // If there's an error parsing, just use the first namespace
          setSelectedNamespaces([namespaces[0]]);
        }
      } else {
        // Otherwise default to first namespace in the list
        setSelectedNamespaces([namespaces[0]]);
      }
    }
  }, [namespaces]);

  const fetchResourceTemplates = useCallback(async () => {
    if (!selectedNamespaces.length) {
      // Clear resource templates when no namespaces are selected
      setResourceTemplates([]);
      return;
    }

    setLoadingResourceTemplates(true);
    try {
      const queryParams = new URLSearchParams();
      selectedNamespaces.forEach((namespace) => {
        queryParams.append("namespace", namespace);
      });
      const response = await fetch(
        `/api/koreo/resource-templates?${queryParams.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to fetch resource templates");
      const data = await response.json();
      setResourceTemplates(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingResourceTemplates(false);
    }
  }, [selectedNamespaces]);

  useEffect(() => {
    fetchResourceTemplates();
  }, [fetchResourceTemplates, selectedNamespaces]);

  useEffect(() => {
    if (selectedNamespaces.length > 0) {
      localStorage.setItem(
        "selectedNamespaces",
        JSON.stringify(selectedNamespaces),
      );
    }
  }, [selectedNamespaces]);

  const filteredTemplates = resourceTemplates.filter((template) => {
    if (activeFilters.length === 0) return true;

    return activeFilters.every((filter) => {
      const value = filter.value.toLowerCase();
      switch (filter.field) {
        case "":
          return (
            template.metadata?.name?.toLowerCase().includes(value) ||
            template.metadata?.namespace?.toLowerCase().includes(value) ||
            template.spec.template.apiVersion.toLowerCase().includes(value) ||
            template.spec.template.kind.toLowerCase().includes(value)
          );
        case "name":
          return template.metadata?.name?.toLowerCase().includes(value);
        case "namespace":
          return template.metadata?.namespace?.toLowerCase().includes(value);
        case "apiversion":
          return template.spec.template.apiVersion
            .toLowerCase()
            .includes(value);
        case "kind":
          return template.spec.template.kind.toLowerCase().includes(value);
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

  const handleNamespaceChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedNamespaces(value);
  };

  return (
    <BreadcrumbsPage>
      <AppPage
        icon={<ConstructionOutlinedIcon />}
        documentTitle="Resource Templates"
        heading="Resource Templates"
      >
        <Box
          sx={{ maxWidth: 500, display: "flex", alignItems: "center", gap: 2 }}
        >
          <FormControl fullWidth margin="normal">
            <InputLabel id="namespace-selector-label">Namespaces</InputLabel>
            <Select
              labelId="namespace-selector-label"
              multiple
              value={selectedNamespaces}
              onChange={handleNamespaceChange}
              input={<OutlinedInput label="Namespaces" />}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      onDelete={(event) => {
                        event.stopPropagation();
                        setSelectedNamespaces((prev) =>
                          prev.filter((namespace) => namespace !== value),
                        );
                      }}
                      onMouseDown={(event) => {
                        event.stopPropagation();
                      }}
                    />
                  ))}
                </Box>
              )}
              variant={"outlined"}
              disabled={loadingNamespaces}
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
          <IconButton
            onClick={() => {
              refetchNamespaces();
              fetchResourceTemplates();
            }}
            disabled={loadingNamespaces || loadingResourceTemplates}
            sx={{ mt: 0.75 }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <Box mt={2}>
          {loadingNamespaces || loadingResourceTemplates ? (
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
          ) : resourceTemplates.length > 0 ? (
            <>
              <FilterInput
                ref={filterInputRef}
                filterInput={filterInput}
                setFilterInput={setFilterInput}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                validFields={["name", "namespace", "apiVersion", "kind"]}
                placeholderExample="kind:bucket"
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
                        onClick={() => handleHeaderClick("namespace")}
                      >
                        Namespace
                      </TableCell>
                      <TableCell
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleHeaderClick("apiVersion")}
                      >
                        API Version
                      </TableCell>
                      <TableCell
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleHeaderClick("kind")}
                      >
                        Kind
                      </TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Last Modified</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTemplates
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((template) => (
                        <TableRow key={template.metadata?.name}>
                          <TableCell>
                            <Box
                              component={StyledLink}
                              href={`/resource-template/${template.metadata?.namespace}/${template.metadata?.name}`}
                            >
                              {template.metadata?.name}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {template.metadata?.namespace || ""}
                          </TableCell>
                          <TableCell>
                            {template.spec.template.apiVersion}
                          </TableCell>
                          <TableCell>{template.spec.template.kind}</TableCell>
                          <TableCell>
                            {localizeTimestamp(
                              template.metadata?.creationTimestamp,
                            )}
                          </TableCell>
                          <TableCell>
                            {localizeTimestamp(getLastModifiedTime(template))}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  component="div"
                  count={filteredTemplates.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </>
          ) : selectedNamespaces.length > 0 && !loadingResourceTemplates ? (
            <Typography>
              No resource templates found for the selected namespaces.
            </Typography>
          ) : null}
        </Box>
      </AppPage>
    </BreadcrumbsPage>
  );
}
