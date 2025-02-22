#!/usr/bin/env bash

set -Eeuo pipefail

# Parse arguments
DRY_RUN=""
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN="--dry-run"
fi

create_work_folder() {
    if [ ! -d ".work" ]; then
        mkdir .work
        echo ".work folder created."
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

tracereqs() {
    go run -C ../../reqmd . -v trace ${DRY_RUN} ../voedger-internals ../voedger-internals/reqman/.work/repos/voedger
}

create_work_folder
actualize_repo "https://github.com/voedger/voedger"
tracereqs

