#!/usr/bin/env bash

set -Eeuo pipefail

check_java_executable() {
    if ! command -v java &> /dev/null; then
        echo "Error: 'java' is not installed or not in the PATH." >&2
        exit 1
    fi
}
create_work_folder() {
    if [ ! -d ".work" ]; then
        mkdir .work
        echo ".work folder created."
    fi
}
download_openfasttrace() {
    # Define variables
    WORK_DIR=".work"
    JAR_FILE="openfasttrace-4.1.0.jar"
    JAR_URL="https://github.com/itsallcode/openfasttrace/releases/download/4.1.0/openfasttrace-4.1.0.jar"

    # Check if the jar file already exists
    if [ ! -f "$WORK_DIR/$JAR_FILE" ]; then
        echo "Downloading $JAR_FILE to $WORK_DIR..."
        curl -L -o "$WORK_DIR/$JAR_FILE" "$JAR_URL"
        if [ $? -eq 0 ]; then
            echo "$JAR_FILE downloaded successfully."
        else
            echo "Error: Failed to download $JAR_FILE." >&2
            exit 1
        fi
    fi
}
actualize_repo() {
    local repoURL="$1"

    # Check if the repo URL is provided
    if [ -z "$repoURL" ]; then
        echo "Error: Repository URL not provided." >&2
        return 1
    fi

    # Extract repoName from the URL
    local repoName
    repoName=$(basename "$repoURL" .git)

    # Define the work directory for repositories
    local reposDir=".work/repos"

    # Create the repos directory if it doesn't exist
    if [ ! -d "$reposDir" ]; then
        mkdir -p "$reposDir"
        echo "$reposDir directory created."
    fi

    # Check if the repository already exists
    local repoPath="$reposDir/$repoName"
    if [ -d "$repoPath/.git" ]; then
        echo "Repository $repoName exists. Pulling latest changes..."
        git -C "$repoPath" pull
        if [ $? -eq 0 ]; then
            echo "Successfully pulled latest changes for $repoName."
        else
            echo "Error: Failed to pull changes for $repoName." >&2
            return 1
        fi
    else
        echo "Cloning $repoName into $reposDir..."
        git clone "$repoURL" "$repoPath"
        if [ $? -eq 0 ]; then
            echo "Successfully cloned $repoName."
        else
            echo "Error: Failed to clone $repoName." >&2
            return 1
        fi
    fi
}
trace() {

    reportFile=".work/report.html"

    java -jar ".work/openfasttrace-4.1.0.jar" trace \
    --log-level INFO \
    --output-file "$reportFile" \
    --output-format html \
    "../server" \
    "../concepts"
    echo "Trace successful, see report at $reportFile"

}

check_java_executable
create_work_folder
download_openfasttrace
actualize_repo "https://github.com/voedger/voedger"
trace

