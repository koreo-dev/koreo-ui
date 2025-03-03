"use client";

export const localizeTimestamp = (
  utcTimestamp: Date | string | undefined,
): string => {
  if (!utcTimestamp) {
    return "unknown";
  }
  const date = new Date(utcTimestamp);
  return date.toLocaleString(undefined, { timeZoneName: "short" });
};

export const getLastModifiedTime = (k8sObject: any): string | undefined => {
  if (!k8sObject?.metadata?.managedFields) {
    return undefined;
  }

  const managedFields = k8sObject.metadata.managedFields;

  // Sort by time in descending order and get the latest timestamp
  const lastModified = managedFields
    .map((field: any) => field.time)
    .filter((time: string | undefined) => time !== undefined)
    .sort(
      (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime(),
    )[0];

  return lastModified || undefined;
};
