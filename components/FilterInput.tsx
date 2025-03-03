import React from "react";
import { Box, TextField, Chip } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

export type FilterCriteria = {
  field: string;
  value: string;
};

interface FilterInputProps {
  filterInput: string;
  setFilterInput: (value: string) => void;
  activeFilters: FilterCriteria[];
  setActiveFilters: React.Dispatch<React.SetStateAction<FilterCriteria[]>>;
  validFields?: string[];
  placeholderExample?: string;
}

const FilterInput = React.forwardRef<HTMLInputElement, FilterInputProps>(
  (
    {
      filterInput,
      setFilterInput,
      activeFilters,
      setActiveFilters,
      validFields,
      placeholderExample,
    }: FilterInputProps,
    ref,
  ) => {
    const handleFilterInputKeyDown = (event: React.KeyboardEvent) => {
      // Normalize validFields to lowercase
      validFields?.forEach((field, index) => {
        validFields[index] = field.toLowerCase();
      });
      if (event.key === "Enter" && filterInput) {
        const filterParts = filterInput.split(":");

        if (
          filterParts.length === 2 &&
          (!validFields || validFields.includes(filterParts[0].toLowerCase()))
        ) {
          // Valid field filter
          const [field, value] = filterParts;
          setActiveFilters((prev) => [
            ...prev,
            {
              field: field.toLowerCase(),
              value: value.trim(),
            },
          ]);
        } else if (filterParts.length !== 2) {
          // No field so just filter on the value
          setActiveFilters((prev) => [
            ...prev,
            {
              field: "",
              value: filterInput.trim(),
            },
          ]);
          setFilterInput("");
        }
        setFilterInput("");
      } else if (
        event.key === "Backspace" &&
        filterInput === "" &&
        activeFilters.length > 0
      ) {
        // Remove the last filter when backspace is pressed and input is empty
        setActiveFilters((prev: FilterCriteria[]) => prev.slice(0, -1));
      }
    };

    const handleRemoveFilter = (filterToRemove: FilterCriteria) => {
      setActiveFilters((prev) =>
        prev.filter(
          (filter) =>
            !(
              filter.field === filterToRemove.field &&
              filter.value === filterToRemove.value
            ),
        ),
      );
    };

    if (!placeholderExample) {
      placeholderExample = "field:value";
    }

    return (
      <TextField
        fullWidth
        inputRef={ref}
        variant="outlined"
        placeholder={
          activeFilters.length === 0
            ? `Add filter (e.g. ${placeholderExample})`
            : ""
        }
        value={filterInput}
        onChange={(e) => setFilterInput(e.target.value)}
        onKeyDown={handleFilterInputKeyDown}
        InputProps={{
          startAdornment: (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 0.5,
                ml: 1,
              }}
            >
              <FilterListIcon color="action" sx={{ mr: 0.5 }} />
              {activeFilters.map((filter, index) => (
                <Chip
                  key={
                    filter.field
                      ? `${filter.field}-${filter.value}-${index}`
                      : `${filter.value}-${index}`
                  }
                  label={
                    filter.field
                      ? `${filter.field}: ${filter.value}`
                      : filter.value
                  }
                  onDelete={() => handleRemoveFilter(filter)}
                  color="primary"
                  size="small"
                  sx={{
                    maxWidth: "200px",
                    ".MuiChip-label": {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                  }}
                />
              ))}
            </Box>
          ),
          sx: {
            paddingLeft: 0,
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& input": {
              ml: 1,
              width: activeFilters.length > 0 ? "auto" : "100%",
              minWidth: "100px",
            },
          },
        }}
      />
    );
  },
);

FilterInput.displayName = "FilterInput";

export default FilterInput;
