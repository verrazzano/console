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

### Adding Oracle-approved library dependencies
First, make sure that the library dependency you want to add is Oracle-approved for distribution. Otherwise, please do not proceed.

This involves more than just installing your library. We need to edit a JSON file to tell JET to bundle the third party library with our application.
Please either copy and edit one of the existing entries in `src/js/path_mapping.json` (instructions for Oracle JET 9 are here: https://docs.oracle.com/en/middleware/developer-tools/jet/9/develop/add-third-party-tools-or-libraries-your-oracle-jet-application.html)
