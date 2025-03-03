## Getting Started

### Install pnpm

Version 10.2.0 or higher should be used

## Volta installations

- Set the environment variable in your profile script (e.g. .bash_profile, .zshrc, or similar).

```sh
export VOLTA_FEATURE_PNPM=1
```

Running the following command will install and set as the default

```sh
volta install pnpm@8.15.3
```

### Setup your environment:

This step only needs done once to setup your environment.

- Install dependencies into node_modules

```sh
pnpm install
```

### Set environment variables:

```sh
export GITLAB_TOKEN=<your token value>
```

### Connect to GCP

First log in

```sh
gcloud auth login
```

Then get the correct k8s configuration for local work

```sh
gcloud container clusters get-credentials konfig-control-plane --location us-central1 --project your-project-id
```

### Start your dev environment:

This step can be done before development and will auto reload changes made to the app.

```sh
pnpm dev
```

### Build the standalone app:

This step is useful for debugging compile time issues in the docker build. While the editor syntax
engines run great, this is what the docker build uses.

```sh
pnpm build
```

**If you run into errors during the build**
You can delete your kube config located at $HOME/.kube/config and recreate it using

```sh
gcloud container clusters get-credentials konfig-control-plane --location us-central1 --project your-project-id
```

### Start the standalone app:

This step can run the compiled application.

```sh
pnpm start
```

### Clean files before committing:

```sh
pnpm clean
```
