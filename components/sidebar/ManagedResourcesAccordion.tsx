import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/hljs";
import { KubernetesObjectWithSpecAndStatus } from "@koreo/koreo-ts";

interface ManagedResourcesAccordionProps {
  resource: KubernetesObjectWithSpecAndStatus;
  expanded: string | false;
  onChange: (
    panel: string,
  ) => (event: React.SyntheticEvent, expanded: boolean) => void;
}

const ManagedResourcesAccordion: React.FC<ManagedResourcesAccordionProps> = ({
  resource,
  expanded,
  onChange,
}) => {
  const managedResources =
    resource.metadata?.annotations?.["koreo.dev/managed-resources"];
  return managedResources ? (
    <Box paddingTop={2} paddingLeft={2} paddingRight={2}>
      <Accordion
        expanded={expanded === "managed-resources-render"}
        onChange={onChange("managed-resources-render")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={"#404F71"} fontWeight={"bold"}>
            Managed Resources
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ fontSize: "12px" }}>
          <SyntaxHighlighter
            language="yaml"
            style={a11yDark}
            customStyle={{ backgroundColor: "#282331" }}
          >
            {JSON.stringify(JSON.parse(managedResources), null, 2)}
          </SyntaxHighlighter>
        </AccordionDetails>
      </Accordion>
    </Box>
  ) : (
    <></>
  );
};

export default ManagedResourcesAccordion;
