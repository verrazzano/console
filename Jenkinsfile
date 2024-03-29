// Copyright (c) 2020, 2024, Oracle and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

def DOCKER_IMAGE_TAG

pipeline {
    agent {
       docker {
            image "${RUNNER_DOCKER_IMAGE}"
            args "${RUNNER_DOCKER_ARGS}"
            registryUrl "${RUNNER_DOCKER_REGISTRY_URL}"
            registryCredentialsId 'ocir-pull-and-push-account'
            label "2.0-large"
        }
    }

    environment {
        DOCKER_CI_IMAGE_NAME = 'console-jenkins'
        DOCKER_PUBLISH_IMAGE_NAME = 'console'
        DOCKER_IMAGE_NAME = "${env.BRANCH_NAME ==~ /^release-.*/ || env.BRANCH_NAME == 'master' ? env.DOCKER_PUBLISH_IMAGE_NAME : env.DOCKER_CI_IMAGE_NAME}"
        CREATE_LATEST_TAG = "${env.BRANCH_NAME == 'master' ? '1' : '0'}"
        DOCKER_CREDS = credentials('github-packages-credentials-rw')
        DOCKER_REPO = 'ghcr.io'
        DOCKER_NAMESPACE = 'verrazzano'
    }

    stages {
        stage('Cleanup') {
            when { not { buildingTag() } }
            steps {
                sh """
                    sudo rm -rf jet_components node_modules bower_components coverage dist web staged-themes themes .trivyignore scanning-report-grype.json scanning-report-trivy.json
                """
            }
        }

        stage('Copyright Compliance Check') {
            when { not { buildingTag() } }
            steps {
                copyrightScan "${WORKSPACE}"
            }
        }

        stage('Lint code') {
            when { not { buildingTag() } }
            steps {
                sh """
                    make lint-code
                """
            }
        }

        stage('Unit Test') {
            when { not { buildingTag() } }
            steps {
                sh """
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
                    DOCKER_IMAGE_TAG = "v${VERRAZZANO_DEV_VERSION}-${TIMESTAMP}-${SHORT_COMMIT_HASH}"
                }
                sh """
                    echo "${DOCKER_CREDS_PSW}" | docker login ${env.DOCKER_REPO} -u ${DOCKER_CREDS_USR} --password-stdin
                    make push DOCKER_REPO=${env.DOCKER_REPO} DOCKER_NAMESPACE=${env.DOCKER_NAMESPACE} DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG} CREATE_LATEST_TAG=${CREATE_LATEST_TAG}
                """
            }
        }

        stage('Scan Image') {
            when { not { buildingTag() } }
            steps {
                script {
                    scanContainerImage "${env.DOCKER_REPO}/${env.DOCKER_NAMESPACE}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: '**/scanning-report*.json', allowEmptyArchive: true
                }
            }
        }

    }

    post {
        failure {
            script {
                if (env.BRANCH_NAME == "master" || env.BRANCH_NAME ==~ "release-.*" || env.BRANCH_NAME ==~ "mark/*") {
                    slackSend ( message: "Job Failed - \"${env.JOB_NAME}\" build: ${env.BUILD_NUMBER}\n\nView the log at:\n ${env.BUILD_URL}\n\nBlue Ocean:\n${env.RUN_DISPLAY_URL}" )
                }
            }
        }
    }
}
