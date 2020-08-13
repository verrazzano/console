# Verrazzano Console - Coming Soon

An Oracle JET based UI for Verrazzano. Under construction

## Prerequisites
Install Oracle JET
```
npm install -g @oracle/ojet-cli
```

## Running the UI locally
To run with authentication enabled, you will need the following environment variables set:
```
export VZ_AUTH=true
export VZ_KEYCLOAK_URL=<your keycloak url> e.g. https://keycloak.default.11.22.33.44.xip.io
export VZ_UI_URL=http://localhost:8000
export VZ_CLIENT_ID=<your client id which allows redirect uri on localhost:8000>
```

From the project root directory run the following command, and then navigate to `http://localhost:8000` in your browser
```
ojet serve
```

## Developing the UI

### Introducing a new dependency
Please be aware that pull requests that seek to introduce a new dependency will be subject to additional review. In general, contributors should avoid dependencies with incompatible licenses, and should try to use recent versions of dependencies. Standard security vulnerability checklists will be consulted before accepting a new dependency. Dependencies on closed-source code, including Oracle's, will most likely be rejected.

Dependencies that satisfy all those constraints, can be added by:
* Installing the dependency using `npm i <dep@version> --save`
* Editing the `src/js/path_mapping.json` file to tell JET to bundle the library with the application. Instructions for Oracle JET 9 are here: https://docs.oracle.com/en/middleware/developer-tools/jet/9/develop/add-third-party-tools-or-libraries-your-oracle-jet-application.html
