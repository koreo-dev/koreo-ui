# Koreo UI

Koreo UI is a lightweight, read-only application that provides a visual
representation of your Koreo Workflows and related resources.

## Installing

Refer to the [Koreo documentation](https://koreo.dev/docs/koreo-ui) for steps
on installing Koreo UI.

## Getting Started for Development

### Install pnpm

Version 10.2.0 or higher should be used.

### Install Dependencies

```sh
pnpm install
```

### Authenticate with Kubernetes

Locally, Koreo UI leverages kubeconfig credentials at ~/.kube/config to
authenticate with a Kubernetes cluster. Ensure that you have authenticated
properly, either with `kubectl` or, if using a cloud-managed Kubernetes such as
GKE, with the respective tooling such as `gcloud`.

Refer to the [Kubernetes documentation](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)
for more.

### Start the Dev Environment

To run the application in development mode:

```sh
pnpm dev
```

### Build

To build the application:

```sh
pnpm build
```

To build the Docker image:

```sh
docker build -t koreo-ui .
```

### Start the Production Environment

To run the built application:

```sh
pnpm start
```

### Clean Files Before Committing

Ensure `pnpm clean` is run on any code that is committed:

```sh
pnpm clean
```
