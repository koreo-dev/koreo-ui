import {
  KubernetesCondition,
  KubernetesStatus,
  KubernetesObjectWithSpecAndStatus,
} from "@koreo/koreo-ts";
import { NodeStatus } from "@/lib/diagrams";

export const parseCrdForStatus = (
  crd: KubernetesObjectWithSpecAndStatus | null | undefined,
): NodeStatus => {
  let retStatus: NodeStatus = NodeStatus.healthy;
  if (!crd || !crd.status || !crd.status.conditions) {
    return retStatus;
  }
  if (crd.status?.terminalCondition?.state == "CONDITION_FAILED") {
    return NodeStatus.error;
  }

  crd.status.conditions.forEach((condition) => {
    if (condition.type === "Ready") {
      if (condition.status === "False") {
        if (
          condition.reason === "Updating" ||
          condition.reason === "RetryWait"
        ) {
          retStatus = NodeStatus.inProgress;
          return;
        }
        retStatus = NodeStatus.error;
        return;
      } else {
        if (
          condition.reason === "Waiting" ||
          condition.reason === "Wait" ||
          condition.reason === "DepSkip"
        ) {
          retStatus = NodeStatus.inProgress;
        } else if (
          condition.reason === "UpToDate" ||
          condition.reason === "Ready"
        ) {
          retStatus = NodeStatus.healthy;
        } else {
          retStatus = NodeStatus.error;
        }
        return;
      }
    } else if (condition.type === "ACK.ResourceSynced") {
      // AWS ACK
      if (condition.status === "True") {
        retStatus = NodeStatus.healthy;
      } else {
        retStatus = NodeStatus.error;
      }
    }
  });
  return retStatus;
};

export const timeAgoReadyCondition = (
  status: KubernetesStatus | null | undefined,
): string => {
  const readyCondition = status?.conditions?.find(
    (condition) => condition.reason == "Ready",
  );
  if (readyCondition) {
    return timeAgo(readyCondition, false);
  }

  const upToDateCondition = status?.conditions?.find(
    (condition) => condition.reason == "UpToDate",
  );
  if (upToDateCondition) {
    return timeAgo(upToDateCondition, true);
  }
  return "N/A";
};

export const timeAgo = (
  condition: KubernetesCondition,
  transition: boolean,
  excludePrefix?: boolean,
): string => {
  let prefix = transition ? "Last Transitioned: " : "Last Reconciled: ";
  if (excludePrefix) {
    prefix = "";
  }
  const units = [
    ["year", 365 * 24 * 60 * 60 * 1000],
    ["month", 30.5 * 24 * 60 * 60 * 1000],
    ["day", 24 * 60 * 60 * 1000],
    ["hour", 60 * 60 * 1000],
    ["minute", 60 * 1000],
    ["second", 1000],
  ] as const;

  const date = new Date(
    transition
      ? condition?.lastTransitionTime || ""
      : condition?.lastUpdateTime || condition?.lastTransitionTime || "",
  );
  const diff = new Date().getTime() - date.getTime();
  const elapsed = Math.abs(diff);

  for (const [name, size] of units) {
    const value = Math.floor(elapsed / size);
    if (value > 0) {
      const plural = value > 1 ? "s" : "";
      const description = `${value} ${name}${plural}`;
      return diff > 0
        ? `${prefix}${description} ago`
        : `${prefix}in ${description}`;
    }
  }

  return prefix + "just now";
};

export const getResourceDisplayName = (
  resource: KubernetesObjectWithSpecAndStatus | undefined,
): string => {
  const spec = resource?.spec;
  if (typeof spec === "object" && spec !== null && "displayName" in spec) {
    return (spec as Record<string, unknown>)["displayName"] as string;
  }
  return resource?.metadata?.name || "n/a";
};
