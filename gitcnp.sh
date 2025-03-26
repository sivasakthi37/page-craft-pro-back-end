#!/bin/bash

# Default commit message if none provided
COMMIT_MESSAGE=${1:-"Added VAD Energy component with model, routes, and documentation"}

# Display what's being committed
echo "Git add, commit, and push script"
echo "Commit message: $COMMIT_MESSAGE"

# Add all changes
echo "Adding all changes..."
git add .

# Commit with the provided message
echo "Committing changes..."
git commit -m "$COMMIT_MESSAGE"

# Push to the current branch
echo "Pushing to remote..."
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
git push origin $CURRENT_BRANCH

echo "Done! Changes pushed to $CURRENT_BRANCH"
