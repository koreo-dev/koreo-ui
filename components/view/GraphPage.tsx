"use client";

import "@/app/globals.css";
import { useState, useEffect, ReactNode, ReactElement } from "react";
import { NodeProps } from "@xyflow/react";
import { KoreoNode } from "@/components/CustomNode";
import NodeSidebar from "@/components/sidebar/NodeSidebar";
import GraphDiagram from "@/components/GraphDiagram";
import BreadcrumbsPage from "@/components/view/BreadcrumbsPage";
import { ToggleButton, ToggleButtonGroup, SvgIconProps } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import AppPage from "@/components/view/AppPage";

interface GraphPageProps {
  heading: string | ReactNode;
  documentTitle: string;
  graphEndpoint: string;
  stateKey: string;
  breadcrumbs?: { name: string; href?: string }[];
  workloadId?: string;
  toggleable?: boolean;
  listViewContent?: ReactNode;
  icon?: ReactElement<SvgIconProps>;
}

const GraphPage: React.FC<React.PropsWithChildren<GraphPageProps>> = ({
  heading,
  documentTitle,
  graphEndpoint,
  stateKey,
  breadcrumbs,
  workloadId,
  toggleable = false,
  listViewContent,
  icon,
  children,
}) => {
  const [selectedNode, setSelectedNode] =
    useState<NodeProps<KoreoNode> | null>(null);
  const [openNodeSidebar, setOpenNodeSidebar] = useState(false);
  const [view, setView] = useState<"graph" | "list">("list");
  const [loadedViewSetting, setLoadedViewSetting] = useState<boolean>(false);

  useEffect(() => {
    // Set the selected view from localStorage if there is one
    const savedView = localStorage.getItem("view");
    if (savedView !== null && (savedView === "graph" || savedView === "list")) {
      setView(savedView);
    }
    setLoadedViewSetting(true);
  }, []);

  let workflow = undefined;
  if (
    selectedNode?.data.workflow?.metadata?.namespace &&
    selectedNode?.data.workflow?.metadata?.name
  ) {
    workflow = {
      namespace: selectedNode.data.workflow.metadata.namespace,
      name: selectedNode.data.workflow.metadata.name,
    };
  }

  const handleViewChange = (
    _event: React.MouseEvent<HTMLElement>,
    newView: "graph" | "list" | null,
  ) => {
    if (newView !== null) {
      setView(newView);
      localStorage.setItem("view", newView);
    }
  };

  const viewToggle = loadedViewSetting ? (
    <ToggleButtonGroup
      value={view}
      exclusive
      onChange={handleViewChange}
      aria-label="view mode"
      size="small"
    >
      <ToggleButton value="list" aria-label="list view">
        <ViewListIcon fontSize="small" />
      </ToggleButton>
      <ToggleButton value="graph" aria-label="graph view">
        <AccountTreeIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  ) : undefined;

  return loadedViewSetting || !toggleable ? (
    <BreadcrumbsPage
      breadcrumbs={breadcrumbs}
      breadcrumbsBarElement={toggleable ? viewToggle : undefined}
    >
      {view === "graph" || !toggleable ? (
        <>
          <GraphDiagram
            documentTitle={documentTitle}
            graphEndpoint={graphEndpoint}
            stateKey={stateKey}
            onNodeSidebar={setOpenNodeSidebar}
            onSetSelectedNode={setSelectedNode}
          >
            {children}
          </GraphDiagram>
          <NodeSidebar
            krm={selectedNode?.data.krm}
            workflow={workflow}
            name={selectedNode?.data.name || ""}
            workloadId={workloadId}
            open={openNodeSidebar}
            onClose={() => {
              setOpenNodeSidebar(false);
              setSelectedNode(null);
            }}
          />
        </>
      ) : (
        <AppPage heading={heading} documentTitle={documentTitle} icon={icon}>
          {listViewContent}
        </AppPage>
      )}
    </BreadcrumbsPage>
  ) : null;
};

export default GraphPage;
