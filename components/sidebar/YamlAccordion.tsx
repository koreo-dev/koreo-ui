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
import yaml from "js-yaml";
import { KubernetesObjectWithSpecAndStatus } from "@/lib/k8s/types";

interface YamlAccordionProps {
  resource: KubernetesObjectWithSpecAndStatus;
  expanded: string | false;
  onChange: (
    panel: string,
  ) => (event: React.SyntheticEvent, expanded: boolean) => void;
}

const YamlAccordion: React.FC<YamlAccordionProps> = ({
  resource,
  expanded,
  onChange,
}) => {
  const resourceCopy = JSON.parse(JSON.stringify(resource));
  // Delete noisy junk before rendering YAML.
  delete resourceCopy.metadata?.annotations;
  delete resourceCopy.metadata?.finalizers;
  delete resourceCopy.metadata?.managedFields;

  return (
    <Box paddingTop={2} paddingLeft={2} paddingRight={2}>
      <Accordion
        expanded={expanded === "yaml-render"}
        onChange={onChange("yaml-render")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={"#404F71"} fontWeight={"bold"}>
            YAML
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
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
            {yaml.dump(resourceCopy)}
          </SyntaxHighlighter>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default YamlAccordion;
