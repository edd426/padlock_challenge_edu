# Infrastructure as Code (IaC) - Math Padlock Challenge

This directory contains the Infrastructure as Code (Bicep) templates for deploying the Math Padlock Challenge application to Azure.

## Overview

Instead of manually creating Azure resources via the CLI, you can use these Bicep templates to:
- Deploy all infrastructure repeatably
- Version control your infrastructure
- Easily spin up/down environments
- Ensure consistency across deployments

## Files

- `main.bicep` - Main Bicep template defining all Azure resources
- `parameters.json` - Parameters for resource configuration
- `../scripts/deploy-infra.sh` - Deployment script (creates infrastructure)
- `../scripts/destroy-infra.sh` - Destruction script (removes infrastructure)

## Prerequisites

- Azure CLI installed: https://docs.microsoft.com/cli/azure/install-azure-cli
- Azure subscription with available quota
- Authenticated to Azure: `az login`

## Quick Start

### Deploy Infrastructure

```bash
# Deploy to production
./scripts/deploy-infra.sh prod

# Or with default environment
./scripts/deploy-infra.sh
```

This creates:
- Resource Group: `rg-padlock-challenge`
- Storage Account: `stpadlockchallenge`
- Storage Table: `challenges`

**Output**: Connection string saved to `.env.azure`

### Destroy Infrastructure

```bash
# Remove all resources
./scripts/destroy-infra.sh
```

**WARNING**: This permanently deletes the resource group and all data. The script will ask for confirmation before proceeding.

## What Gets Created

### Resource Group
- **Name**: `rg-padlock-challenge`
- **Location**: `eastus2` (where Azure Static Web Apps is available)
- **Purpose**: Container for all resources

### Storage Account
- **Name**: `stpadlockchallenge`
- **Type**: Storage V2 (General purpose)
- **SKU**: Standard_LRS (Locally Redundant Storage)
- **Purpose**: Stores challenge data in Table Storage

### Table Storage
- **Table Name**: `challenges`
- **Purpose**: Stores the active challenge configuration as JSON

## Configuration

Edit `parameters.json` to customize:

```json
{
  "location": "eastus2",
  "environment": "prod",
  "storageAccountName": "stpadlockchallenge"
}
```

**Note**: Resource group is created by the `deploy-infra.sh` script before Bicep deployment.

## Usage Examples

### Deploy to new environment

```bash
# Deploy to staging
cp parameters.json parameters.staging.json
# Edit parameters.staging.json to change values
./scripts/deploy-infra.sh staging
```

### Get Storage Connection String

After deployment, the connection string is saved to `.env.azure`:

```bash
cat .env.azure
```

Or retrieve from Azure:

```bash
az storage account show-connection-string \
  --name stpadlockchallenge \
  --resource-group rg-padlock-challenge \
  --output tsv
```

### Verify Deployment

```bash
# List all resources in resource group
az resource list \
  --resource-group rg-padlock-challenge \
  --output table

# Check storage account details
az storage account show \
  --name stpadlockchallenge \
  --resource-group rg-padlock-challenge

# List tables
az storage table list \
  --account-name stpadlockchallenge
```

## Troubleshooting

### "Subscription does not have availability for resource..."

The Azure region doesn't have available quota. Try a different region in `parameters.json`:
- `eastus2` (primary)
- `westus2`
- `centralus`
- `eastasia`
- `westeurope`

### "Storage account name already taken"

Storage account names must be globally unique. Edit `parameters.json` with a different name:

```json
"storageAccountName": "stpadlockchallenge123"
```

### "Resource group already exists"

If you get an error that the resource group exists but is in a failed state:

```bash
# Delete and try again
az group delete --name rg-padlock-challenge --yes

# Then redeploy
./scripts/deploy-infra.sh
```

## Next Steps

After deployment:

1. Get the connection string from `.env.azure`
2. Update `.env.local` with the connection string
3. Deploy the Static Web App (see DEPLOYMENT.md)
4. Configure app settings with the connection string
5. Test the application

## Bicep Documentation

- [Bicep Language Reference](https://docs.microsoft.com/azure/azure-resource-manager/bicep/file)
- [Storage Account Template](https://docs.microsoft.com/azure/templates/microsoft.storage/storageaccounts)
- [Table Storage Template](https://docs.microsoft.com/azure/templates/microsoft.storage/storageaccounts/tableservices/tables)

## Cost Estimation

| Resource | SKU | Monthly Cost |
|----------|-----|--------------|
| Storage Account | Standard LRS | ~$0.50-1.00 |
| **Total** | | **~$0.50-1.00** |

*Note: Static Web App is created separately and hosted on free tier (~$0)*

## Security Notes

- Storage account has HTTPS enforced
- Blob public access is disabled
- TLS 1.2+ required
- Store connection string securely (`.env.azure` and `.env.local` are in `.gitignore`)

## Contributing

When modifying these templates:

1. Test locally with `./scripts/deploy-infra.sh`
2. Verify all resources are created
3. Test destruction with `./scripts/destroy-infra.sh`
4. Update this README if adding new resources
5. Commit changes with clear messages

## Support

For issues or questions:
- [Azure Bicep Docs](https://docs.microsoft.com/azure/azure-resource-manager/bicep/)
- [GitHub Issues](https://github.com/edd426/padlock_challenge_edu/issues)
