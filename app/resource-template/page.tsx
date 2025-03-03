"use client";

import { useState, useEffect, useRef } from "react";
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
} from "@mui/material";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import StyledLink from "@/components/StyledLink";
import "../globals.css";
import AppPage from "@/components/view/AppPage";
import { localizeTimestamp, getLastModifiedTime } from "@/utils/datetime";
import FilterInput, { FilterCriteria } from "@/components/FilterInput";
import { ResourceTemplate } from "@koreo/koreo-ts";
import BreadcrumbsPage from "@/components/view/BreadcrumbsPage";

// @ts-ignore
const fetcher = (...args: any[]) => fetch(...args).then((res) => res.json());

export default function Page() {
  const [selectedNamespace, setSelectedNamespace] = useState<string>("");
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
    const fetchResourceTemplates = async () => {
      setLoadingResourceTemplates(true);
      try {
        const response = await fetch(
          `/api/koreo/${selectedNamespace}/resource-templates`,
        );
        if (!response.ok) throw new Error("Failed to fetch resource templates");
        const data = await response.json();
        setResourceTemplates(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingResourceTemplates(false);
      }
    };

    if (selectedNamespace) {
      fetchResourceTemplates();
    }
  }, [selectedNamespace]);

  useEffect(() => {
    if (selectedNamespace) {
      localStorage.setItem("selectedNamespace", selectedNamespace);
    }
  }, [selectedNamespace]);

  const filteredTemplates = resourceTemplates.filter((template) => {
    if (activeFilters.length === 0) return true;

    return activeFilters.every((filter) => {
      const value = filter.value.toLowerCase();
      switch (filter.field) {
        case "":
          return (
            template.metadata?.name?.toLowerCase().includes(value) ||
            template.spec.template.apiVersion.toLowerCase().includes(value) ||
            template.spec.template.kind.toLowerCase().includes(value)
          );
        case "name":
          return template.metadata?.name?.toLowerCase().includes(value);
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

  return (
    <BreadcrumbsPage>
      <AppPage
        icon={<ConstructionOutlinedIcon />}
        documentTitle="Resource Templates"
        heading="Resource Templates"
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
                validFields={["name", "apiVersion", "kind"]}
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
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredTemplates.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            </>
          ) : selectedNamespace && !loadingResourceTemplates ? (
            <Typography>
              No resource templates found for this namespace.
            </Typography>
          ) : null}
        </Box>
      </AppPage>
    </BreadcrumbsPage>
  );
}
