import { getK8sCoreV1Api } from "@/lib/k8s/client";

export const listAllNamespaces = async (): Promise<string[]> => {
  const api = getK8sCoreV1Api();
  try {
    const response = await api.listNamespace();
    return response.body.items.map((ns) => ns.metadata?.name || "");
  } catch (error) {
    console.error("Error fetching namespaces:", error);
    return [];
  }
};
