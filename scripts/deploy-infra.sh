#!/bin/bash

# Math Padlock Challenge - Infrastructure Deployment Script
# This script deploys all Azure infrastructure required for the application
# Usage: ./scripts/deploy-infra.sh [environment]

set -e  # Exit on error

# Configuration
ENVIRONMENT=${1:-prod}
LOCATION="eastus"
RESOURCE_GROUP_NAME="rg-padlock-challenge"
DEPLOYMENT_NAME="padlock-challenge-${ENVIRONMENT}-$(date +%s)"
BICEP_FILE="./infra/main.bicep"
PARAMETERS_FILE="./infra/parameters.json"

echo "=================================="
echo "Math Padlock Challenge - IaC Deploy"
echo "=================================="
echo "Environment: $ENVIRONMENT"
echo "Location: $LOCATION"
echo "Resource Group: $RESOURCE_GROUP_NAME"
echo "Deployment Name: $DEPLOYMENT_NAME"
echo ""

# Verify prerequisites
echo "Checking prerequisites..."
if ! command -v az &> /dev/null; then
    echo "ERROR: Azure CLI (az) is not installed. Please install it first."
    echo "Visit: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "WARNING: jq is not installed. Some features may not work."
    echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
fi

# Verify Bicep files exist
if [ ! -f "$BICEP_FILE" ]; then
    echo "ERROR: Bicep file not found: $BICEP_FILE"
    exit 1
fi

if [ ! -f "$PARAMETERS_FILE" ]; then
    echo "ERROR: Parameters file not found: $PARAMETERS_FILE"
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

# Create Resource Group if it doesn't exist
echo "Checking Resource Group..."
if az group exists --name "$RESOURCE_GROUP_NAME" | grep -q "true"; then
    echo "✓ Resource Group already exists: $RESOURCE_GROUP_NAME"
else
    echo "Creating Resource Group: $RESOURCE_GROUP_NAME"
    az group create \
        --name "$RESOURCE_GROUP_NAME" \
        --location "$LOCATION" \
        --tags environment=$ENVIRONMENT project=padlock-challenge
    echo "✓ Resource Group created"
fi
echo ""

# Validate Bicep template
echo "Validating Bicep template..."
az deployment group validate \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --template-file "$BICEP_FILE" \
    --parameters @"$PARAMETERS_FILE" > /dev/null
echo "✓ Template validation successful"
echo ""

# Deploy infrastructure
echo "Deploying infrastructure..."
echo "This may take 2-5 minutes..."
echo ""

DEPLOYMENT_OUTPUT=$(az deployment group create \
    --name "$DEPLOYMENT_NAME" \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --template-file "$BICEP_FILE" \
    --parameters @"$PARAMETERS_FILE")

if [ $? -eq 0 ]; then
    echo "✓ Deployment successful!"
    echo ""

    # Extract and display outputs
    echo "Deployment Outputs:"
    echo "===================="

    if command -v jq &> /dev/null; then
        echo "$DEPLOYMENT_OUTPUT" | jq -r '.properties.outputs | to_entries[] | "\(.key): \(.value.value)"'
    else
        echo "$DEPLOYMENT_OUTPUT" | grep -A 100 '"outputs"' || true
    fi

    echo ""
    echo "Storage Connection String:"
    echo "============================"
    STORAGE_CONN_STRING=$(az deployment group show \
        --name "$DEPLOYMENT_NAME" \
        --resource-group "$RESOURCE_GROUP_NAME" \
        --query 'properties.outputs.storageConnectionString.value' \
        --output tsv)
    echo "$STORAGE_CONN_STRING"
    echo ""

    # Save connection string to file
    echo "$STORAGE_CONN_STRING" > ".env.azure"
    echo "✓ Connection string saved to .env.azure"
    echo ""

    echo "=================================="
    echo "✓ DEPLOYMENT COMPLETE"
    echo "=================================="
    echo ""
    echo "Next steps:"
    echo "1. Update .env.local with the connection string from .env.azure"
    echo "2. Deploy the Static Web App with the connection string as environment variable"
    echo "3. Test the application at https://gentle-field-08c20650f.3.azurestaticapps.net"
    echo ""

else
    echo "✗ Deployment failed!"
    exit 1
fi
