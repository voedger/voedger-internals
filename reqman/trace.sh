#!/usr/bin/env bash

set -Eeuo pipefail

# Default command
COMMAND="help"

# Parse command
if [[ $# -gt 0 && ! "$1" =~ ^-- ]]; then
    COMMAND="$1"
    shift
fi

# Parse arguments
DRY_RUN=""
LOCAL_VOEDGER=""
VERBOSE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN="--dry-run"
            shift
            ;;
        --local-voedger)
            LOCAL_VOEDGER="true"
            shift
            ;;
        --v)
            VERBOSE="true"
            shift
            ;;            
        *)
            echo "Error: Unknown flag $1" >&2
            exit 1
            ;;
    esac
done

update_reqmd() {
    GOPROXY=direct go install github.com/voedger/reqmd@main
}

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
    local voedger_path="../../voedger"
    if [[ -z "$LOCAL_VOEDGER" ]]; then
        voedger_path="../../voedger-internals/reqman/.work/repos/voedger"
    fi
    update_reqmd
    reqmd ${VERBOSE:-} trace ${DRY_RUN:-} .. "$voedger_path"
}

show_help() {
    echo "Usage: $0 [command] [flags]"
    echo ""
    echo "Commands:"
    echo "  help         Show this help message (default)"
    echo "  trace        Trace requirements coverage"
    echo ""
    echo "Flags:"
    echo "  --dry-run       Run in dry-run mode"
    echo "  --local-voedger Use local voedger repository"
}

case "$COMMAND" in
    help)
        show_help
        ;;
    trace)
        create_work_folder
        if [[ -z "$LOCAL_VOEDGER" ]]; then
            actualize_repo "https://github.com/voedger/voedger"
        fi
        tracereqs
        ;;
    *)
        echo "Error: Unknown command $COMMAND" >&2
        show_help
        exit 1
        ;;
esac

