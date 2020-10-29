// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { safeLoadAll } from "js-yaml";
import { KubeClient } from "./kubeclient";
import { KindUtil } from "./kindUtil";

const vzNamespace = "verrazzano-system";
const verrazzanoRepoPath = process.env.VERRAZZANO_REPO_PATH;
const verrazzanoHelmChartDir = `${verrazzanoRepoPath}/install/chart`;
const verrazzanoOperatorHelmTemplate = `${verrazzanoHelmChartDir}/templates/01-verrazzano-operator.yaml`;
const consoleDockerImage = process.env.CONSOLE_DOCKER_IMAGE;
const clusterName = "console-selenium";
const kindConfigFile = `${__dirname}/kind_config.yaml`;
const consoleManifestTemplate = `${__dirname}/console_manifest.yaml`;

const helmTemplateReplace = async (
  chartPath: string,
  outputLocation: string
): Promise<void> => {
  const imagePullPolicyArg = `--set image.pullPolicy=IfNotPresent`; // image is loaded into KinD cluster, don't pull it again
  const otherArgs = `--set config.envName=default --set config.dnsSuffix=dummy.verrazzano.io`;

  const cmd = `helm template verrazzano ${chartPath} --namespace ${vzNamespace} ${imagePullPolicyArg} ${otherArgs}`;
  const output = await KindUtil.runCommandLine(
    cmd,
    `failed to locally replace templates on helm chart at ${chartPath}`,
    false
  );
  fs.writeFileSync(outputLocation, output);
};

const createNodePort = async (kubeClient: KubeClient): Promise<string> => {
  const nodePortManifestFile = `${__dirname}/node-port.yaml`;
  return kubeClient.kubectlFromFile(nodePortManifestFile, "apply");
};

const deployVerrazzanoOperator = async (
  kubeClient: KubeClient,
  consoleNodePortURL: string
) => {
  // Copy operator template
  const tempDir = path.join(os.tmpdir());
  const helmChartDir = fs.mkdtempSync(tempDir);
  const helmChartTemplatesDir = path.join(helmChartDir, "templates");
  fs.mkdirSync(helmChartTemplatesDir);

  console.log(`Copying Helm chart to temp dir ${helmChartDir}`);
  fs.copyFileSync(
    verrazzanoOperatorHelmTemplate,
    path.join(
      helmChartTemplatesDir,
      path.basename(verrazzanoOperatorHelmTemplate)
    )
  );
  fs.copyFileSync(
    `${verrazzanoHelmChartDir}/values.yaml`,
    path.join(helmChartDir, "values.yaml")
  );
  fs.copyFileSync(
    `${verrazzanoHelmChartDir}/Chart.yaml`,
    path.join(helmChartDir, "Chart.yaml")
  );

  const actualOperatorManifest = path.join(
    tempDir,
    "verrazzano-operator-manifest.yaml"
  );
  await helmTemplateReplace(helmChartDir, actualOperatorManifest);

  const allYamls = safeLoadAll(
    fs.readFileSync(actualOperatorManifest).toString("utf-8")
  );

  const deployment = allYamls.find((yaml) => yaml.kind === "Deployment");
  if (!deployment) {
    throw new Error(
      `No Deployment found in verrazzano-operator YAML at ${actualOperatorManifest}, which is based on template ${verrazzanoOperatorHelmTemplate}`
    );
  }
  const containersYaml = deployment.spec.template.spec.containers as any[];
  if (!containersYaml || containersYaml.length !== 1) {
    throw new Error(
      `Expected exactly one container on the verrazzano-operator deployment ${actualOperatorManifest}!`
    );
  }
  const verrazzanoOperatorImage = containersYaml[0].image;

  // add startController=false argument to verrazzano operator startup
  // Turn off auth on verrazzano operator by setting apiServerRealm to empty string
  if (containersYaml[0].args) {
    const args = containersYaml[0].args as string[];
    args.push("--startController=false");
    const idx = args.findIndex((arg) => arg.startsWith("--apiServerRealm"));
    if (idx === -1) {
      args.push("--apiServerRealm=");
    } else {
      args[idx] = "--apiServerRealm=";
    }
  } else {
    throw new Error(
      `Did not find args section on the container in the verrazzano-operator deployment in ${actualOperatorManifest}`
    );
  }

  const accessControlOriginEnv = {
    ALLOW_ACCESS_CONTROL_ORIGIN: consoleNodePortURL,
  };
  if (containersYaml[0].env) {
    containersYaml[0].env.push(accessControlOriginEnv);
  } else {
    containersYaml[0].env = [accessControlOriginEnv];
  }

  if (!verrazzanoOperatorImage) {
    throw new Error(
      `Verrazzano operator image not found in manifest file ${actualOperatorManifest}!`
    );
  }

  const editedOperatorManifest = path.join(
    tempDir,
    "verrazzano-operator-modified.yaml"
  );
  KindUtil.dumpAllYamlsToFile(allYamls, editedOperatorManifest);
  await KindUtil.pullDockerImage(verrazzanoOperatorImage);
  await KindUtil.kindLoadDockerImage(clusterName, verrazzanoOperatorImage);
  console.log(
    `Applying verrazzano-operator manifest ${editedOperatorManifest}`
  );
  await kubeClient.kubectlFromFile(editedOperatorManifest, "apply");
  console.log("Creating NodePort service verrazzano-operator");
  await createNodePort(kubeClient);
};

const deployConsole = async (kubeClient: KubeClient, consoleYamls: any[]) => {
  const operatorNodePortAddr = await getVerrazzanoOperatorNodePortURL(
    kubeClient
  );
  console.log(`Operator URL is ${operatorNodePortAddr}`);

  const deployment = consoleYamls.find((yaml) => yaml.kind === "Deployment");
  if (!deployment) {
    throw new Error(
      `No Deployment found in console YAML at ${consoleManifestTemplate}`
    );
  }

  const containersYaml = deployment.spec.template.spec.containers as any[];
  if (!containersYaml || containersYaml.length !== 1) {
    throw new Error(
      `Expected exactly one container on the console deployment ${consoleManifestTemplate}!`
    );
  }
  const containerEnv = containersYaml[0].env as any[];
  let apiUrlEnvItem = containerEnv.find(
    (envItem) => envItem.name === "VZ_API_URL"
  );
  if (!apiUrlEnvItem) {
    apiUrlEnvItem = { name: "VZ_API_URL", value: operatorNodePortAddr };
  } else {
    apiUrlEnvItem.value = operatorNodePortAddr;
  }

  containersYaml[0].image = consoleDockerImage;
  const tempDir = path.join(os.tmpdir());
  const editedConsoleManifest = path.join(tempDir, "console-modified.yaml");
  console.log(
    `Dumping edited Console manifest to file ${editedConsoleManifest}`
  );
  KindUtil.dumpAllYamlsToFile(consoleYamls, editedConsoleManifest);
};

const setupIntegTestEnv = async () => {
  try {
    if (!vzNamespace) {
      throw new Error("Verrazzano Namespace must be provided!");
    }

    if (!verrazzanoRepoPath) {
      throw new Error(
        "Environment variable VERRAZZANO_REPO_PATH must be set to the directory path of the cloned 'verrazzano' repository"
      );
    }

    if (!consoleDockerImage) {
      throw new Error(
        "Environment variable CONSOLE_DOCKER_IMAGE must be set to the docker_image:tag of the console Docker image to use"
      );
    }
    const modelCrdFile = `${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanomodels_crd.yaml`;
    const bindingCrdFile = `${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanobindings_crd.yaml`;
    const monitoringInstCrdFile = `${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanomonitoringinstances_crd.yaml`;
    const vmcCrdFile = `${verrazzanoHelmChartDir}/crds/verrazzano.io_verrazzanomanagedclusters_crd.yaml`;

    let kubeConfigFile = process.env.KIND_KUBECONFIG;
    if (kubeConfigFile) {
      console.log(
        `Using existing KinD cluster as specified in KIND_KUBECONFIG env var: ${kubeConfigFile}\n`
      );
    } else {
      console.log(`Deleting existing KinD cluster ${clusterName}`);
      await KindUtil.deleteExistingKindCluster(clusterName);

      console.log(`Creating KinD cluster ${clusterName}`);
      kubeConfigFile = await KindUtil.createKindCluster(
        clusterName,
        kindConfigFile
      );
    }
    console.log("Initializing Kubernetes API Client");

    const kubeClient = new KubeClient(kubeConfigFile);

    await kubeClient.createNamespace(vzNamespace);
    console.log(`Creating Verrazzano Model CRD from file ${modelCrdFile}`);
    await kubeClient.createCrd(modelCrdFile);
    console.log(`Creating Verrazzano Binding CRD from file ${bindingCrdFile}`);
    await kubeClient.createCrd(bindingCrdFile);
    console.log(
      `Creating Verrazzano Monitoring Instances CRD from file ${monitoringInstCrdFile}`
    );
    await kubeClient.createCrd(monitoringInstCrdFile);
    console.log(
      `Creating Verrazzano Managed Clusters CRD from file ${vmcCrdFile}`
    );
    await kubeClient.createCrd(vmcCrdFile);
    console.log("Deploying Verrazzano Operator");
    const consoleYamls = KindUtil.readAllYamlsInFile(consoleManifestTemplate);
    const nodePort = KindUtil.findNodePortInYaml(consoleYamls);
    const consoleNodePortURL = await makeNodePortURL(kubeClient, nodePort);
    await deployVerrazzanoOperator(kubeClient, consoleNodePortURL);
    await deployConsole(kubeClient, consoleYamls);
    console.log(`Console NodePort URL is: ${consoleNodePortURL}`);
    console.log(
      `Verrazzano Operator NodePort URL is: ${getVerrazzanoOperatorNodePortURL(
        kubeClient
      )}`
    );
  } catch (error) {
    console.log(`Failed to create Kubernetes objects! ${error}`);
    throw error;
  }
};

const getVerrazzanoOperatorNodePortURL = async (
  kubeClient: KubeClient
): Promise<string> => {
  try {
    const nodePort = await kubeClient.getServiceNodePort(
      "verrazzano-operator",
      vzNamespace
    );
    return await makeNodePortURL(kubeClient, nodePort);
  } catch (error) {
    console.log("Failed to get verrazzano-operator URL!");
    return null;
  }
};

const makeNodePortURL = async (
  kubeClient: KubeClient,
  port: number
): Promise<string> => {
  const nodeAddr = await kubeClient.getNodeInternalIPAddr(
    `${clusterName}-worker`
  );
  return nodeAddr ? `http://${nodeAddr}:${port}` : null;
};

setupIntegTestEnv().catch((err) => {
  console.log(`An error occurred: ${err}`);
  process.exit(1);
});
