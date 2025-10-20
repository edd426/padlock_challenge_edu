#!/bin/bash

# Math Padlock Challenge - Infrastructure Destruction Script
# This script completely removes all Azure infrastructure for the application
# WARNING: This is destructive and cannot be undone!
# Usage: ./scripts/destroy-infra.sh [environment]

set -e  # Exit on error

# Configuration
ENVIRONMENT=${1:-prod}
RESOURCE_GROUP_NAME="rg-padlock-challenge"

echo "=================================="
echo "Math Padlock Challenge - IaC Destroy"
echo "=================================="
echo ""
echo "⚠️  WARNING: This will DELETE all resources in the resource group:"
echo "   Resource Group: $RESOURCE_GROUP_NAME"
echo ""
echo "This includes:"
echo "   - Storage Account and all data"
echo "   - Static Web App"
echo "   - All associated resources"
echo ""
echo "This action CANNOT be undone!"
echo ""

# Confirm deletion
read -p "Are you ABSOLUTELY SURE you want to delete this resource group? Type 'yes' to confirm: " confirmation

if [ "$confirmation" != "yes" ]; then
    echo "Destruction cancelled."
    exit 0
fi

# Double check
read -p "Final confirmation - Type the resource group name to confirm deletion [$RESOURCE_GROUP_NAME]: " rg_confirm

if [ "$rg_confirm" != "$RESOURCE_GROUP_NAME" ]; then
    echo "Resource group name does not match. Destruction cancelled."
    exit 0
fi

# Verify prerequisites
echo ""
echo "Checking prerequisites..."
if ! command -v az &> /dev/null; then
    echo "ERROR: Azure CLI (az) is not installed."
    exit 1
fi

# Check Azure login
echo "Verifying Azure authentication..."
if ! az account show &> /dev/null; then
    echo "Not authenticated. Running 'az login'..."
    az login
fi

SUBSCRIPTION_ID=$(az account show --query id -o tsv)
ACCOUNT_NAME=$(az account show --query name -o tsv)
echo "✓ Authenticated to Azure subscription: $ACCOUNT_NAME ($SUBSCRIPTION_ID)"
echo ""

# Verify resource group exists
if ! az group exists --name "$RESOURCE_GROUP_NAME" | grep -q "true"; then
    echo "ERROR: Resource group does not exist: $RESOURCE_GROUP_NAME"
    exit 1
fi

echo "Destroying resource group: $RESOURCE_GROUP_NAME"
echo "This may take 2-5 minutes..."
echo ""

az group delete \
    --name "$RESOURCE_GROUP_NAME" \
    --yes \
    --no-wait

if [ $? -eq 0 ]; then
    echo "✓ Deletion request submitted (running in background)"
    echo ""
    echo "To monitor progress, run:"
    echo "  az group show --name $RESOURCE_GROUP_NAME --query 'properties.provisioningState' -o tsv"
    echo ""
    echo "Or wait for confirmation:"
    echo "  az group wait --name $RESOURCE_GROUP_NAME --deleted"
    echo ""
else
    echo "✗ Deletion failed!"
    exit 1
fi

# Clean up local files
if [ -f ".env.azure" ]; then
    rm .env.azure
    echo "✓ Cleaned up local .env.azure file"
fi

echo ""
echo "=================================="
echo "✓ RESOURCE GROUP DELETION INITIATED"
echo "=================================="
echo ""
echo "The resource group is being deleted in the background."
echo "It may take up to 15 minutes for all resources to be completely removed."
echo ""
