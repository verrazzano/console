// Copyright (c) 2020, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

def DOCKER_IMAGE_TAG

pipeline {
    agent {
       docker {
            image "${RUNNER_DOCKER_IMAGE}"
            args "${RUNNER_DOCKER_ARGS}"
            registryUrl "${RUNNER_DOCKER_REGISTRY_URL}"
            registryCredentialsId 'ocir-pull-and-push-account'
        }
    }

    environment {
        DOCKER_CI_IMAGE_NAME = 'console-jenkins'
        DOCKER_PUBLISH_IMAGE_NAME = 'console'
        DOCKER_IMAGE_NAME = "${env.BRANCH_NAME == 'master' ? env.DOCKER_PUBLISH_IMAGE_NAME : env.DOCKER_CI_IMAGE_NAME}"
        CREATE_LATEST_TAG = "${env.BRANCH_NAME == 'master' ? '1' : '0'}"
        DOCKER_CREDS = credentials('github-packages-credentials-rw')
        DOCKER_REPO = 'ghcr.io'
        DOCKER_NAMESPACE = 'verrazzano'
        NODE_VERSION='14.7'
        NVM_VERSION='v0.35.3'
    }

    stages {
        stage('Copyright Compliance Check') {
            when { not { buildingTag() } }
            steps {
                copyrightScan "${WORKSPACE}"
            }
        }

        stage('Get node') {
            steps {
                sh """
                    sudo yum install -y bzip2
                    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/${NVM_VERSION}/install.sh | bash
                    [ -s "${HOME}/.nvm/nvm.sh" ] && . "${HOME}/.nvm/nvm.sh"
                    nvm install ${env.NODE_VERSION}
                    nvm ls
                    nvm use ${env.NODE_VERSION}
                """
            }
        }
        stage('Lint code') {
            when { not { buildingTag() } }
            steps {
                sh """
                    [ -s "${HOME}/.nvm/nvm.sh" ] && . "${HOME}/.nvm/nvm.sh"
                    nvm use ${env.NODE_VERSION}
                    make lint-code
                """
            }
        }

        stage('Unit Test') {
            when { not { buildingTag() } }
            steps {
                sh """
                    [ -s "${HOME}/.nvm/nvm.sh" ] && . "${HOME}/.nvm/nvm.sh"
                    nvm use ${env.NODE_VERSION}
                    make unit-test
                """
            }
        }

        stage('Docker Build') {
            when { not { buildingTag() } }
            steps {
                script {
                    def props = readProperties file: '.verrazzano-development-version'
                    VERRAZZANO_DEV_VERSION = props['verrazzano-development-version']
                    TIMESTAMP = sh(returnStdout: true, script: "date +%Y%m%d%H%M%S").trim()
                    SHORT_COMMIT_HASH = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()
                    DOCKER_IMAGE_TAG = "${VERRAZZANO_DEV_VERSION}-${TIMESTAMP}-${SHORT_COMMIT_HASH}"
                }
                sh """
                    echo "${DOCKER_CREDS_PSW}" | docker login ${env.DOCKER_REPO} -u ${DOCKER_CREDS_USR} --password-stdin
                    [ -s "${HOME}/.nvm/nvm.sh" ] && . "${HOME}/.nvm/nvm.sh"
                    nvm use ${env.NODE_VERSION}
                    make push DOCKER_REPO=${env.DOCKER_REPO} DOCKER_NAMESPACE=${env.DOCKER_NAMESPACE} DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG} CREATE_LATEST_TAG=${CREATE_LATEST_TAG}
                """
            }
        }

        stage('Integ Test') {
            when {
                    expression { false == true }
            }
            environment {
                CLUSTER_NAME='console-integ-test'
            }
            steps {
                checkout poll: false, scm: [
                        $class                           : 'GitSCM',
                        branches                         : [[name: 'develop']],
                        browser: [$class: 'GithubWeb', repoUrl: 'https://github.com/verrazzano/verrazzano'],
                        doGenerateSubmoduleConfigurations: false,
                        extensions                       : [
                                [$class: 'RelativeTargetDirectory', relativeTargetDir: 'verrazzano'],
                                [$class: 'CleanBeforeCheckout'],
                        ],
                        submoduleCfg                     : [],
                        userRemoteConfigs                : [
                                [credentialsId: 'github-markxnelns-private-access-token', url: 'https://github.com/verrazzano/verrazzano.git']
                        ],
                ]
                sh """
                    [ -s "${HOME}/.nvm/nvm.sh" ] && . "${HOME}/.nvm/nvm.sh"
                    nvm use ${env.NODE_VERSION}
                    VERRAZZANO_REPO_PATH=${WORKSPACE}/verrazzano CLUSTER_NAME=${env.CLUSTER_NAME} make integ-test
                """
            }
            post {
                always {
                    sh "CLUSTER_NAME=${env.CLUSTER_NAME} make delete-cluster"
                }
            }
        }

        stage('Scan Image') {
            when { not { buildingTag() } }
            steps {
                script {
                    clairScanTemp "${env.DOCKER_REPO}/${env.DOCKER_NAMESPACE}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: '**/scanning-report.json', allowEmptyArchive: true
                }
            }
        }

    }

    post {
        failure {
            mail to: "${env.BUILD_NOTIFICATION_TO_EMAIL}", from: "${env.BUILD_NOTIFICATION_FROM_EMAIL}",
            subject: "Verrazzano: ${env.JOB_NAME} - Failed",
            body: "Job Failed - \"${env.JOB_NAME}\" build: ${env.BUILD_NUMBER}\n\nView the log at:\n ${env.BUILD_URL}\n\nBlue Ocean:\n${env.RUN_DISPLAY_URL}"
        }
    }
}

