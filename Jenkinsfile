// Declarative Jenkins pipeline for the Node.js web app (DevOps Practical Work 5)
// Part 1: Clone -> Install -> Test -> Build
// Part 2: Build Docker image -> Push to Docker Hub -> Deploy to the local Docker host (staging) -> Verify
pipeline {
    agent any

    environment {
        DOCKER_IMAGE          = 'emmgjules/jenkins-web-app'   // Docker Hub repository
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'      // Jenkins credentials ID (username + access token)
        IMAGE_TAG             = "1.0.${BUILD_NUMBER}"         // unique, versioned tag for every build
        CONTAINER_NAME        = 'my-web-app'
        STAGING_PORT          = '8081'                        // host port of the staging container
    }

    triggers {
        // Check GitHub for new commits every 2 minutes and build automatically.
        // (Jenkins runs on localhost, so GitHub cannot reach it with a webhook.)
        pollSCM('H/2 * * * *')
    }

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '15'))
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Clone') {
            steps {
                echo "Cloning ${env.GIT_URL ?: 'repository'} (branch ${env.BRANCH_NAME ?: 'main'})..."
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        stage('Install') {
            steps {
                echo 'Installing dependencies with npm ci...'
                sh 'node --version && npm --version'
                sh 'npm ci'
            }
        }

        stage('Test') {
            steps {
                echo 'Running unit tests (npm test)...'
                sh 'npm run test:ci'
            }
            post {
                always {
                    junit 'test-results.xml'   // results appear in the Jenkins "Tests" tab
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Building the project...'
                sh 'npm run build'
                sh 'ls -la'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${DOCKER_IMAGE}:${IMAGE_TAG}")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_CREDENTIALS_ID) {
                        dockerImage.push("${IMAGE_TAG}")
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo "Deploying ${DOCKER_IMAGE}:${IMAGE_TAG} to the local Docker host..."
                sh '''
                    docker rm -f ${CONTAINER_NAME} || true
                    docker run -d --name ${CONTAINER_NAME} --restart unless-stopped \
                        -p ${STAGING_PORT}:3000 \
                        -e APP_ENV=staging -e APP_VERSION=${IMAGE_TAG} \
                        ${DOCKER_IMAGE}:${IMAGE_TAG}
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                // Jenkins runs in a container, so the host is reached through host.docker.internal
                retry(5) {
                    sleep(time: 3, unit: 'SECONDS')
                    sh 'curl -fsS http://host.docker.internal:${STAGING_PORT}/health'
                }
                sh 'docker ps --filter name=${CONTAINER_NAME}'
                sh 'docker logs ${CONTAINER_NAME}'
            }
        }
    }

    post {
        success {
            echo "SUCCESS: ${DOCKER_IMAGE}:${IMAGE_TAG} is live on http://localhost:${STAGING_PORT}"
        }
        failure {
            echo 'FAILED: check the console output above. The previous staging container is only replaced after the tests pass.'
        }
    }
}
