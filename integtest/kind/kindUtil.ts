// Copyright (C) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

import { exec } from "child_process";
import * as fs from "fs";
import { safeDump } from "js-yaml";
import * as os from "os";
import * as path from "path";

const kindestNodeImage =
  "kindest/node:v1.16.9@sha256:7175872357bc85847ec4b1aba46ed1d12fa054c83ac7a8a11f5c268957fd5765";
export class KindUtil {
  static async runCommandLine(
    cmd: string,
    actionDesc: string,
    ignoreErr: boolean = false
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (stderr) {
          console.error(stderr);
        }
        if (!error || ignoreErr) {
          resolve(stdout || stderr);
        } else {
          reject(new Error(`failed to ${actionDesc}. ${error.message}`));
        }
      });
    });
  }

  static dumpAllYamlsToFile(yamls: any[], filePath: string) {
    // delete the file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    fs.appendFileSync(filePath, "---\n");
    yamls.forEach((yaml) => {
      fs.appendFileSync(filePath, `${safeDump(yaml, { indent: 2 })}---\n`);
    });
  }

  static async pullDockerImage(dockerImage: string): Promise<string> {
    const cmd = `docker pull ${dockerImage}`;
    console.log(`Pulling docker image locally: ${dockerImage}`);
    return KindUtil.runCommandLine(
      cmd,
      `pull docker image locally: ${dockerImage}`,
      false
    );
  }

  static async kindLoadDockerImage(clusterName: string, dockerImage: string) {
    const cmd = `kind load docker-image --name ${clusterName} ${dockerImage}`;
    console.log(
      `Loading docker image ${dockerImage} into KinD cluster ${clusterName}`
    );
    return KindUtil.runCommandLine(
      cmd,
      `load docker image: ${dockerImage}`,
      false
    );
  }

  static async deleteExistingKindCluster(clusterName: string) {
    const cmd = `kind delete cluster --name ${clusterName}`;
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (stdout) {
          console.log(stdout);
        }
        if (stderr) {
          console.error(stderr);
        }
        if (error) {
          console.error(error);
        }
        // No need to fail on error since cluster might not exist
        resolve(stdout || stderr);
      });
    });
  }

  static async createKindCluster(
    clusterName: string,
    kindConfigFile: string
  ): Promise<string> {
    const tempDir = os.tmpdir();
    const kubeConfigFile = path.join(tempDir, "console-selenium-kubeconfig");
    const cmd = `kind create cluster --wait 30s --image ${kindestNodeImage} --name ${clusterName} --config ${kindConfigFile} --kubeconfig ${kubeConfigFile}`;
    return new Promise((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (stdout) {
          console.log(stdout);
        }
        if (stderr) {
          console.error(stderr);
        }
        if (error) {
          reject(
            new Error(
              `failed to create KinD cluster using config ${kindConfigFile}. ${error.message}`
            )
          );
        } else {
          resolve(kubeConfigFile);
        }
      });
    });
  }
}
