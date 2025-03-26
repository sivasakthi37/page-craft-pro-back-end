#!/bin/bash

# Default commit message
commit_message=${1:-"changes made"}

# Add all changes
git add .

# Commit with the provided message or default message
git commit -m "$commit_message"

# Push to the current branch
git push
