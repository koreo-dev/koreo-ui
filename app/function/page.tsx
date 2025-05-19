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
import FunctionsOutlinedIcon from "@mui/icons-material/FunctionsOutlined";
import StyledLink from "@/components/StyledLink";
import "../globals.css";
import AppPage from "@/components/view/AppPage";
import { localizeTimestamp, getLastModifiedTime } from "@/utils/datetime";
import FilterInput, { FilterCriteria } from "@/components/FilterInput";
import { Function } from "@koreo/koreo-ts";
import BreadcrumbsPage from "@/components/view/BreadcrumbsPage";
import RefreshIcon from "@mui/icons-material/Refresh";

// @ts-ignore
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

export default function Page() {
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [functions, setFunctions] = useState<Function[]>([]);
  const [loadingFunctions, setLoadingFunctions] = useState(false);
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

  const fetchFunctions = useCallback(async () => {
    if (!selectedNamespaces.length) {
      // Clear functions when no namespaces are selected
      setFunctions([]);
      return;
    }

    setLoadingFunctions(true);
    try {
      const queryParams = new URLSearchParams();
      selectedNamespaces.forEach((namespace) => {
        queryParams.append("namespace", namespace);
      });
      const response = await fetch(
        `/api/koreo/functions?${queryParams.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to fetch functions");
      const data = await response.json();
      setFunctions(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFunctions(false);
    }
  }, [selectedNamespaces]);

  useEffect(() => {
    fetchFunctions();
  }, [fetchFunctions, selectedNamespaces]);

  useEffect(() => {
    if (selectedNamespaces.length > 0) {
      localStorage.setItem(
        "selectedNamespaces",
        JSON.stringify(selectedNamespaces),
      );
    }
  }, [selectedNamespaces]);

  const filteredFunctions = functions.filter((func) => {
    if (activeFilters.length === 0) return true;

    return activeFilters.every((filter) => {
      const value = filter.value.toLowerCase();
      switch (filter.field) {
        case "":
          return (
            func.metadata?.name?.toLowerCase().includes(value) ||
            func.metadata?.namespace?.toLowerCase().includes(value) ||
            func.kind?.toLowerCase().includes(value)
          );
        case "name":
          return func.metadata?.name?.toLowerCase().includes(value);
        case "namespace":
          return func.metadata?.namespace?.toLowerCase().includes(value);
        case "kind":
          return func.kind?.toLowerCase().includes(value);
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
        icon={<FunctionsOutlinedIcon />}
        documentTitle="Functions"
        heading="Functions"
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
              fetchFunctions();
            }}
            disabled={loadingNamespaces || loadingFunctions}
            sx={{ mt: 0.75 }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <Box mt={2}>
          {loadingNamespaces || loadingFunctions ? (
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
          ) : functions.length > 0 ? (
            <>
              <FilterInput
                ref={filterInputRef}
                filterInput={filterInput}
                setFilterInput={setFilterInput}
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                validFields={["name", "namespace", "kind"]}
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
                        onClick={() => handleHeaderClick("kind")}
                      >
                        Kind
                      </TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Last Modified</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFunctions
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((func) => (
                        <TableRow key={func.metadata?.name}>
                          <TableCell>
                            <Box
                              component={StyledLink}
                              href={`/function/${func.metadata?.namespace}/${func.metadata?.name}?kind=${func.kind!}`}
                            >
                              {func.metadata?.name}
                            </Box>
                          </TableCell>
                          <TableCell>
                            {func.metadata?.namespace || ""}
                          </TableCell>
                          <TableCell>{func.kind || ""}</TableCell>
                          <TableCell>
                            {localizeTimestamp(
                              func.metadata?.creationTimestamp,
                            )}
                          </TableCell>
                          <TableCell>
                            {localizeTimestamp(getLastModifiedTime(func))}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50, 100]}
                  component="div"
                  count={filteredFunctions.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </>
          ) : selectedNamespaces.length > 0 && !loadingFunctions ? (
            <Typography>
              No functions found for the selected namespaces.
            </Typography>
          ) : null}
        </Box>
      </AppPage>
    </BreadcrumbsPage>
  );
}
