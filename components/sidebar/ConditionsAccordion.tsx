import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PendingOutlinedIcon from "@mui/icons-material/PendingOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import HourglassBottomOutlinedIcon from "@mui/icons-material/HourglassBottomOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { timeAgo } from "@/lib/k8s/utils";
import {
  KubernetesObjectWithSpecAndStatus,
  KubernetesCondition,
} from "@koreo/koreo-ts";

interface ConditionsAccordionProps {
  resource: KubernetesObjectWithSpecAndStatus;
  expanded: string | false;
  onChange: (
    panel: string,
  ) => (event: React.SyntheticEvent, expanded: boolean) => void;
}

const getConditionIcon = (condition: KubernetesCondition): JSX.Element => {
  if (condition.status !== "True") {
    return <ErrorOutlineOutlinedIcon color="error" />;
  }

  if (condition.reason === "Skip" || condition.message?.includes("Skipping")) {
    return <NotInterestedOutlinedIcon color="disabled" />;
  }

  if (condition.status === "True" && condition.reason === "UpToDate") {
    return <CheckCircleOutlineRoundedIcon color="success" />;
  }

  if (
    condition.status === "True" &&
    (condition.type.startsWith("ACK.") || condition.reason === "Ready")
  ) {
    return <CheckCircleOutlineRoundedIcon color="success" />;
  }

  if (
    condition.reason === "Waiting" ||
    condition.reason === "Wait" ||
    condition.reason === "DepSkip"
  ) {
    return <HourglassBottomOutlinedIcon color="action" />;
  }

  return <PendingOutlinedIcon color="info" />;
};

const ConditionsAccordion: React.FC<ConditionsAccordionProps> = ({
  resource,
  expanded,
  onChange,
}) => {
  return resource.status?.conditions ? (
    <Box paddingTop={2} paddingLeft={2} paddingRight={2}>
      <Accordion
        expanded={expanded === "conditions"}
        onChange={onChange("conditions")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={"#404F71"} fontWeight={"bold"}>
            Health Status
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List aria-labelledby="health-status-subheader">
            {resource.status?.conditions?.map((condition, index) => (
              <Tooltip
                title={`${timeAgo(condition, true)}`}
                placement={"right"}
                key={index}
                arrow
              >
                <ListItem>
                  <ListItemIcon>{getConditionIcon(condition)}</ListItemIcon>
                  <ListItemText color={"#404F71"}>
                    {condition.message || "The resource is up to date"}
                  </ListItemText>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  ) : (
    <></>
  );
};

export default ConditionsAccordion;
