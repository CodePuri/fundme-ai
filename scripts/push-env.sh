#!/bin/bash

# fundme-ai Vercel Environment Variable Sync
# This script pushes local .env values to Vercel Production.

# Load .env variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

# Function to push env var to Vercel
push_env() {
    local key=$1
    local value=$2
    if [ -z "$value" ]; then
        echo "Skipping $key: Value is empty."
        return
    fi
    echo "Pushing $key to Vercel Production..."
    echo "$value" | npx vercel env add "$key" production --force
}

# Sync Clerk variables
push_env "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
push_env "CLERK_SECRET_KEY" "$CLERK_SECRET_KEY"
push_env "NEXT_PUBLIC_CLERK_SIGN_IN_URL" "$NEXT_PUBLIC_CLERK_SIGN_IN_URL"
push_env "NEXT_PUBLIC_CLERK_SIGN_UP_URL" "$NEXT_PUBLIC_CLERK_SIGN_UP_URL"
push_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL" "$NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL"
push_env "NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL" "$NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL"

# Sync Supabase variables
push_env "SUPABASE_URL" "$SUPABASE_URL"
push_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY"

echo "Environment variables synced to Vercel Production."
