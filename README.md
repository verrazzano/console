# Verrazzano Console

You can use the Verrazzano Console to access and manage Verrazzano components and applications deployed to a Verrazzano environment.

The Verrazzano Console repository includes:

- [hooks](scripts/hooks): The [Oracle JavaScript Extension Toolkit (JET) hooks](https://docs.oracle.com/en/middleware/developer-tools/jet/10.1/develop/customize-web-application-tooling-workflow.html#GUID-D19EC0A2-DFEF-4928-943A-F8CC08961453) used for building and running the Console application.
- [jet-composites](src/ts/jet-composites): The [Oracle JET Custom Components](https://docs.oracle.com/en/middleware/developer-tools/jet/10.1/develop/design-custom-web-components.html) which are basic building blocks for the Console.
- [views](src/ts/views) and [viewModels](src/ts/viewModels): The Oracle JET Views and ViewModels used in the Console. See [Oracle JET Architecture](https://docs.oracle.com/en/middleware/developer-tools/jet/10.1/develop/oracle-jet-architecture.html#GUID-293CB342-196F-4FC3-AE69-D1226A025FBB) for more details.
- [test](test): The tests and test-related configuration for the Console.

## Prerequisites

- [Node.js](http://nodejs.org/) 14.x+ (with [npm](https://docs.npmjs.com/cli/npm) v6.14.x+)

  To install Node.js, use [nvm](https://github.com/nvm-sh/nvm):

  ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 14.15
  ```

- [Oracle JET CLI](https://github.com/oracle/ojet-cli) 10.1.x+

  The Verrazzano Console uses the [Oracle JET](https://www.oracle.com/webfolder/technetwork/jet/index.html) framework. The Oracle JET command-line interface (`ojet-cli`) is required to run Oracle JET Tooling commands, which you can install with `npm`.

  ```bash
    npm install -g @oracle/ojet-cli@10.1.0
  ```

  For more information, see [Getting Started with Oracle JavaScript Extension Toolkit (JET)](https://docs.oracle.com/en/middleware/developer-tools/jet/9.1/develop/getting-started-oracle-javascript-extension-toolkit-jet.html).

- An existing Verrazzano environment and access to the Verrazzano API and the Keycloak server URL.

  The Verrazzano Console requires the URL of the Verrazzano API Server URL (for fetching environment and application data). The format of the Verrazzano API Server URL typically is `https://verrazzano.v8o-env.v8o-domain.com` where:

  - `v8o-env` is the name of the Verrazzano environment and `v8o-domain.com` is the domain, when a DNS provider is used.
  - `v8o-env` is replaced by `default` and `v8o-domain.com` is the IP address of load balancer for the Kubernetes cluster, when a "magic" DNS provider like `xip.io` is used.

  For more details on installing and accessing Verrazzano, see the [installation instructions](https://github.com/verrazzano/verrazzano/blob/master/install/README.md).

## Setup

Clone the `git` repository and install `npm` dependencies:

```bash
  git clone https://github.com/verrazzano/console.git
  cd console
  nvm use 14.15
  npm install
```

### Set up the Keycloak client

[Keycloak](https://github.com/keycloak/keycloak) provides Identity and Access Management in Verrazzano for authentication to various dashboards and the Console application. To run the Verrazzano Console locally, first you need to configure the **verrazzano-pkce** [OpenID Connect client](https://www.keycloak.org/docs/latest/server_admin/#oidc-clients) to authenticate the login and API requests originating from the application deployed at `localhost`.

1. Access the Keycloak administration console for your Verrazzano environment: `https://keycloak.v8o-env.v8o-domain.com`
2. Log in with the Keycloak admin user and password. Typically the Keycloak admin user name is `keycloakadmin` and the password can be obtained from your management cluster:

```bash
  kubectl get secret --namespace keycloak keycloak-http -o jsonpath={.data.password} | base64 --decode; echo
```

For more information on accessing Keycloak and other user interfaces in Verrazzano, see [Get console credentials](https://github.com/verrazzano/verrazzano/blob/master/install/README.md#6-get-console-credentials).

3. Navigate to **Clients** and select the client, **verrazzano-pkce**. On the **Settings** page, go to **Valid Redirect URIs** and select the plus (+) sign to add the redirect URL `http://localhost:8000/*`.
4. On the same page, go to **Web Origins** and select the plus (+) sign to add `http://localhost:8000`.
5. Click **Save**.

You can also set up a separate Keycloak client for local access using [these](https://www.keycloak.org/docs/latest/server_admin/#oidc-clients) instructions.

### Get Verrazzano user credentials

Verrazzano installations have a default user `verrazzano` configured in the Verrazzano Keycloak server which can be used for authentication for accessing the Console. To get the password for the `verrazzano` user from the management cluster, run:

```bash
   kubectl get secret --namespace verrazzano-system verrazzano -o jsonpath={.data.password} | base64 --decode; echo
```

The Verrazzano Console accesses the Verrazzano API using Verrazzano Auth-Proxy. The Auth-Proxy uses Keycloak to authenticate and authorize the user. Post authentication and authorization, two cookies - vz_authn and vz_userinfo, are set in the browser. The vz_authn cookie is used for the subsequent requests by the Verrazzano Console, while vz_userinfo cookie is consumed by the Verrazzano Console to retrieve information relevant to the logged in user e.g. username.

### Set up environment variables

Set the following environment variable:

```bash
  export VZ_API_URL=<your Verrazzano API Server URL> e.g. https://verrazzano.default.11.22.33.44.xip.io
```

### Start server

To run the Console application in a local web server, run following command:

```bash
  ojet serve
```

This will open a browser at [http://localhost:8000](http://localhost:8000). On first access, it will display a Verrazzano Console home page with a error message. The error message occurs since the console is not allowed to access the Verrazzano Auth-Proxy.

When you make changes to the Console code, the changes are reflected immediately in the browser because the `livereload` option is enabled by default for the `ojet serve` command. For other options supported by the command, see [Serve a Web Application](https://docs.oracle.com/en/middleware/developer-tools/jet/9.1/develop/serve-web-application.html#GUID-75032B22-6365-426D-A63C-33B37B1575D9).

## Testing

Unit tests for the Verrazzano Console use [Karma](https://karma-runner.github.io/latest/index.html) and [Mocha](https://mochajs.org/). For running the tests, you need the [Chrome](https://www.google.com/chrome/) browser. To run tests for the Console, run:

```bash
  make unit-test
```

Integration tests for the Verrazzano Console use [Mocha](https://mochajs.org/) and [Selenium](https://www.selenium.dev/). For running the tests, you need the [Chrome](https://www.google.com/chrome/) browser and the [chromedriver](https://chromedriver.chromium.org/) version appropriate for the version of your Chrome browser.

To run integration tests for the Console:
* Set the environment variable `VZ_UITEST_CONFIG` to a UI test configuration file (a sample is provided in `integtest/config.uitest.json`, which you may edit to add login information).
* Run the tests using the following command:
```
npm run integtest
```

Alternatively, use the following command to run integration tests with default configuration:
````
make run-ui-tests

```

## Building

To build the Console, run the following commands:

- Oracle JET build:

  ```
  make ojet-build
  ```

- Docker build:
  ```
  make build
  ```

## Linting

[ESLint](https://eslint.org/) and [prettier](https://prettier.io/) are used to keep the code style consistent.
To run linting locally:

```
npm run eslint
```

Check the formatting of your code using prettier:

```
npm run prettier
```

To format your code using prettier:

```
npm run prettier-write
```

## Contributing to Verrazzano

Oracle welcomes contributions to this project from anyone. Contributions may be reporting an issue with Verrazzano or submitting a pull request. Before embarking on significant development that may result in a large pull request, it is recommended that you create an issue and discuss the proposed changes with the existing developers first.

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


