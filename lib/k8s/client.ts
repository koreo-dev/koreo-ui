import * as k8s from "@kubernetes/client-node";

let k8sCoreV1ApiInstance: k8s.CoreV1Api | null = null;

export const getK8sCoreV1Api = (): k8s.CoreV1Api => {
  if (!k8sCoreV1ApiInstance) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    k8sCoreV1ApiInstance = kc.makeApiClient(k8s.CoreV1Api);
  }
  return k8sCoreV1ApiInstance;
};
