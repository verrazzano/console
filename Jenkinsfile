// Copyright (c) 2020, Oracle Corporation and/or its affiliates.
// Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.

pipeline {
    options {
      disableConcurrentBuilds()
    }

    agent {
        label "internal"
    }

    parameters {
        string (name: 'DOCKER_IMAGE_VERSION',
                defaultValue: '0.1.0',
                description: 'Docker image version used to create tag for the image:\n'+
                'When RELEASE is selected, image tag will be same as DOCKER_IMAGE_VERSION.\n'+
                'When branch is not master, image tag will be <short git commit sha>-<BUILD_NUMBER> and DOCKER_IMAGE_VERSION is ignored.\n'+
                'When branch is master, image tag will be <DOCKER_IMAGE_VERSION>-<short git commit sha>-<BUILD_NUMBER>.',
                trim: true)
        string (name: 'DOCKER_REPO',
                defaultValue: 'phx.ocir.io',
                description: 'Docker image repo.',
                trim: true)
        string (name: 'DOCKER_NAMESPACE',
                defaultValue: 'stevengreenberginc/verrazzano',
                description: 'Docker image namespace.',
                trim: true)
        string (name: 'DOCKER_REPO_CREDS',
                defaultValue: 'ocir-pull-and-push-account',
                description: 'Credentials for Docker repo.',
                trim: true)
        booleanParam (name: 'RELEASE',
                defaultValue: false,
                description: 'Whether the image is for a new release, select this option when image is to be built with exact tag as defined in DOCKER_IMAGE_VERSION.'
                )
    }

    environment {
        DOCKER_IMAGE_NAME = "${env.BRANCH_NAME == 'master' ? 'console' : 'console-jenkins'}"
        DOCKER_REPO_URL = "https://" + "${params.DOCKER_REPO}" + "/v2"
        DOCKER_IMAGE_TAG = get_image_tag()
        DOCKER_IMAGE_FULL_NAME = "${DOCKER_REPO}/${DOCKER_NAMESPACE}/${DOCKER_IMAGE_NAME}:${DOCKER_IMAGE_TAG}"
        HTTP_PROXY = "http://www-proxy-hqdc.us.oracle.com:80"
        HTTPS_PROXY = "http://www-proxy-hqdc.us.oracle.com:80"
        NO_PROXY = "localhost,127.0.0.1,.us.oracle.com,.oraclecorp.com"
    }

    stages {

        stage('Build') {
            steps {
                withDockerRegistry(credentialsId: params.DOCKER_REPO_CREDS, url: env.DOCKER_REPO_URL) {
                    sh """
                        make push DOCKER_REPO=${params.DOCKER_REPO} DOCKER_NAMESPACE=${params.DOCKER_NAMESPACE} DOCKER_IMAGE_NAME=${DOCKER_IMAGE_NAME} DOCKER_IMAGE_TAG=${DOCKER_IMAGE_TAG} HTTP_PROXY=${HTTP_PROXY} HTTPS_PROXY=${HTTPS_PROXY} NO_PROXY=${NO_PROXY}
                    """
                }
            }
        }

        stage('Scan Image') {
            steps {
                sh ''' 
                    echo "Starting clair scanner ..."
                    rm -rf clair-scan.log scanning-report.json
                    touch clair-scan.log
                    docker pull ${DOCKER_IMAGE_FULL_NAME}
                    docker run --rm -e HTTP_PROXY=${HTTP_PROXY} -e HTTPS_PROXY=${HTTPS_PROXY} -d --name console-$BUILD_ID-db arminc/clair-db:latest
                    docker run --rm -e HTTP_PROXY=${HTTP_PROXY} -e HTTPS_PROXY=${HTTPS_PROXY} --link console-$BUILD_ID-db:postgres -d --name console-$BUILD_ID-clair arminc/clair-local-scan:v2.0.8_0ed98e9ead65a51ba53f7cc53fa5e80c92169207  
                    docker run -e HTTP_PROXY=${HTTP_PROXY} -e HTTPS_PROXY=${HTTPS_PROXY} -v $WORKSPACE:/tmp:Z -v /var/run/docker.sock:/var/run/docker.sock --privileged=true --network=container:console-$BUILD_ID-clair --name console-$BUILD_ID-scan ovotech/clair-scanner clair-scanner -r /tmp/scanning-report.json -l /tmp/clair-scan.log ${DOCKER_IMAGE_FULL_NAME}
                    cat scanning-report.json
                    cat clair-scan.log
                    export UNAPPROVED_COUNT=$(cat clair-scan.log | grep " contains .* unapproved vulnerabilities" | sed -E 's|(.*)(contains )(.*)( unapproved vulnerabilities)|\\3|g')
                    echo $UNAPPROVED_COUNT
                    echo "Completed image scanning for ${DOCKER_IMAGE_FULL_NAME}!"
                    if (($UNAPPROVED_COUNT != "NO")); then echo "${DOCKER_IMAGE_FULL_NAME} image has $UNAPPROVED_COUNT unapproved vulnerabilities" ; exit 1 ; fi ;
                    docker rm -vf console-$BUILD_ID-db console-$BUILD_ID-clair console-$BUILD_ID-scan
                '''
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
            mail to: "${env.BUILD_NOTIFICATION_TO_EMAIL}", from: 'noreply@oracle.com',
            subject: "Verrazzano: ${env.JOB_NAME} - Failed",
            body: "Job Failed - \"${env.JOB_NAME}\" build: ${env.BUILD_NUMBER}\n\nView the log at:\n ${env.BUILD_URL}\n\nBlue Ocean:\n${env.RUN_DISPLAY_URL}"
        }
    }
}

/**
 * Determine the tag name for image
 */
def get_image_tag() {

    short_commit_sha = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()
    if ( params.RELEASE ) {
        return params.DOCKER_IMAGE_VERSION
    }

    if ( env.BRANCH_NAME == 'master' ) {
        return params.DOCKER_IMAGE_VERSION + "-" + short_commit_sha + "-" + BUILD_NUMBER
    }

    return short_commit_sha + "-" + BUILD_NUMBER
}

