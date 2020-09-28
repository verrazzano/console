# Verrazzano Console

The Verrazzano Console is the User Interface for accessing and managing Verrazzano components and applications deployed in a Verrazzano environment.

## Repository structure

The Verrazzano Console repository includes the following components:

- [Oracle JET hooks](scripts/hooks) contains [hooks](https://docs.oracle.com/en/middleware/developer-tools/jet/9.1/develop/customize-web-application-tooling-workflow.html#GUID-D19EC0A2-DFEF-4928-943A-F8CC08961453) used for building and running Console application.
- [Custom Components](src/ts/jet-composites) contains the [Oracle JET Custom Components](https://docs.oracle.com/en/middleware/developer-tools/jet/9.1/develop/design-custom-web-components.html) which are basic building blocks for the Console.
- [views](src/ts/views) and [viewModels](src/ts/viewModels) contain the Oracle JET view and viewModels used in the Console. See [Oracle JET Architecture](https://docs.oracle.com/en/middleware/developer-tools/jet/9.1/develop/oracle-jet-architecture.html#GUID-293CB342-196F-4FC3-AE69-D1226A025FBB) for more details.
- [test](test) contains the tests and tests related configuration for Console.

## Getting Started

### Prerequisites

- [Node.js®](http://nodejs.org/) 14.x+ (with npm v6.14.x+)

  You can use [nvm](https://github.com/nvm-sh/nvm) to install NodeJS.

  ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 14.7
  ```

- [Oracle JET CLI](https://github.com/oracle/ojet-cli) 9.1.x+

  The Verrazzano Console is developed using [Oracle JET](https://www.oracle.com/webfolder/technetwork/jet/index.html) framework. The Oracle JET command-line interface (`ojet-cli`) is required to execute Oracle JET Tooling commands.
  Use `npm` to install the CLI. Read more about the Oracle JET Tooling [here](https://docs.oracle.com/en/middleware/developer-tools/jet/9.1/develop/choose-development-environment-oracle-jet.html#GUID-6AEB5A00-22D8-4BC1-AAB3-4134F906C1C0).

  ```bash
    npm install -g @oracle/ojet-cli
  ```

- Access to Verrazzano API and Keycloak server URL

  The Verrazzano Console requires the URL of the Keycloak server (for authentication) and the Verrazzano API Server URL (for fetching environment and applications' data). The Verrazzano API Server URL generally will be `https://api.v8o-env.v8o-domain.com` and Keycloak server URL will be `https://keycloak.v8o-env.v8o-domain.com`. When OCI DNS is used as DNS provider, `v8o-env` will be the name of the Verrazzano environment and `v8o-domain.com` will be the domain. When `xip.io` is used as the DNS Service, `v8o-env` will be replaced by `default` and `v8o-domain.com` will be the IP Address of OCI Load Balancer.
  For more details on installing and accessing Verrazzano, see the [installation instructions](https://github.com/verrazzano/verrazzano/blob/master/install/README.md).

### Setup

Setup the git repository and install node dependencies:

```bash
  git clone https://github.com/verrazzano/console.git
  cd console
  nvm use 14.7
  npm install
```

### Running Locally

#### Setup Keycloak client:

To run the Verrazzano Console locally, we first need to setup the `webui` client in Keycloak to authenticate login and API requests from the `localhost`. This is the default client used by the Console that is deployed in Verrazzano environment and same client can be used for the development server running on localhost. You may also setup your own separate client for local access. Read more about Keycloak clients [here](https://www.Keycloak.org/docs/latest/server_admin/#oidc-clients).

- Access the Keycloak Administration console for your Verrazzano environment: `https://keycloak.v8o-env.v8o-domain.com`
- Login with Keycloak admin user and password. Generally the Keycloak admin user name is `keycloakadmin` and password can be obtained from your management cluster using
  ```bash
    kubectl get secret --namespace keycloak keycloak-http -o jsonpath={.data.password} | base64 --decode; echo
  ```
  See [Get console credentials](https://github.com/verrazzano/verrazzano/blob/master/install/README.md#6-get-console-credentials) for more information on accessing Keycloak and other user interfaces in a Verrazzano environment.
- Navigate to "Clients" and click the client named "webui". On the Settings screen, go to "Valid Redirect URIs" and click "+" button to add the redirect URL `http://localhost:8000/*`.
- One the same page, go to "Web Origins" and click "+" button to add `http://localhost:8000`.
- Click Save.

#### Get Verrazzano user credentials:

The Verrazzano Console accesses the Verrazzano API using [JWT](https://en.wikipedia.org/wiki/JSON_Web_Token) based authentication provided by [Keycloak Authorization Services](https://www.keycloak.org/docs/4.8/authorization_services/). To access this token from Keycloak, the user accessing the Console must be logged into Verrazzano Keycloak. Verrazzano installations have a default user `verrazzano` configured in Verrazzano Keycloak which can be used to login. To access the password for `verrazzano` user from management cluster, execute

```bash
   kubectl get secret --namespace verrazzano-system verrazzano -o jsonpath={.data.password} | base64 --decode; echo
```

#### Setup environment variables:

Set the following environment variables:

```bash
  export VZ_AUTH=true
  export VZ_KEYCLOAK_URL=<your Keycloak URL> e.g. https://keycloak.default.11.22.33.44.xip.io
  export VZ_UI_URL=http://localhost:8000
  export VZ_CLIENT_ID=<your client id which allows redirect uri on localhost:8000 or webui if using default>
  export VZ_API_URL=<your Verrazzano API Server URL> e.g. https://api.default.11.22.33.44.xip.io
```

##### Start server:

```bash
  ojet serve
```

This should start a browser at [http://localhost:8000](http://localhost:8000). On first access, and on expiry of the [refresh token](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/), you will be required to login to Keycloak with `verrazzano` user and password obtained in [Get Verrazzano user credentials](#get-verrazzano-user-credentials).

## Testing

### Unit tests

Unit tests for Verrazzano Console are written using [Karma](https://karma-runner.github.io/latest/index.html) and [Mocha](https://mochajs.org/) and require the [Chrome browser](https://www.google.com/chrome/) to be installed. To Run Tests for the Console, execute:

```bash
  make unit-test
```

## Building

To build the Console:

- Oracle JET build:

  ```
  make ojet-build
  ```

- Docker build:
  ```
  make build
  ```

## Linting

[ESLint](https://eslint.org/) and [prettier](https://prettier.io/) are used to keep the code style consistent. Both are checked in the build and
a build will fail if either one fails.

Run linting locally:

```
npm run eslint
```

Check formatting of your code using prettier:

```
npm run prettier
```

Formatting your code using prettier:

```
npm run prettier-write
```

## Contributing to Verrazzano

Oracle welcomes contributions to this project from anyone. Contributions may be reporting an issue with the operator or submitting a pull request. Before embarking on significant development that may result in a large pull request, it is recommended that you create an issue and discuss the proposed changes with the existing developers first.

If you want to submit a pull request to fix a bug or enhance an existing feature, please first open an issue and link to that issue when you submit your pull request.

If you have any questions about a possible submission, feel free to open an issue too.

## Contributing to the Verrazzano Console repository

Pull requests can be made under The Oracle Contributor Agreement (OCA), which is available at [https://www.oracle.com/technetwork/community/oca-486395.html](https://www.oracle.com/technetwork/community/oca-486395.html).

For pull requests to be accepted, the bottom of the commit message must have the following line, using the contributor’s name and e-mail address as it appears in the OCA Signatories list.

```
Signed-off-by: Your Name <you@example.org>
```

This can be automatically added to pull requests by committing with:

```
git commit --signoff
```

Only pull requests from committers that can be verified as having signed the OCA can be accepted.

## Pull request process

- Fork the repository.
- Create a branch in your fork to implement the changes. We recommend using the issue number as part of your branch name, for example, `1234-fixes`.
- Ensure that any documentation is updated with the changes that are required by your fix.
- Ensure that any samples are updated if the base image has been changed.
- Submit the pull request. Do not leave the pull request blank. Explain exactly what your changes are meant to do and provide simple steps on how to validate your changes. Ensure that you reference the issue you created as well. We will assign the pull request to 2-3 people for review before it is merged.

## Introducing a new dependency

Please be aware that pull requests that seek to introduce a new dependency will be subject to additional review. In general, contributors should avoid dependencies with incompatible licenses, and should try to use recent versions of dependencies. Standard security vulnerability checklists will be consulted before accepting a new dependency. Dependencies on closed-source code, including Oracle's, will most likely be rejected.

Dependencies that satisfy all those constraints, can be added by:

- Installing the dependency using `npm i <dep@version> --save`
- Editing the [src/js/path_mapping.json](src/js/path_mapping.json) file to tell JET to bundle the library with the application. Instructions for Oracle JET 9 are here: https://docs.oracle.com/en/middleware/developer-tools/jet/9/develop/add-third-party-tools-or-libraries-your-oracle-jet-application.html.

## Useful links

- [Oracle JET Cookbook](https://www.oracle.com/webfolder/technetwork/jet/jetCookbook.html)
- [VComponent API Documentation](https://www.oracle.com/webfolder/technetwork/jet/jsdocs/VComponent.html)
- [Overview of Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
