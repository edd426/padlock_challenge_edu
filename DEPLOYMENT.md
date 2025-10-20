# Deployment Guide - Math Padlock Challenge

This guide walks through deploying the Math Padlock Challenge to Azure with GitHub Actions CI/CD.

## Prerequisites

- Azure subscription (free trial available at azure.microsoft.com)
- Azure CLI installed (`az --version`)
- GitHub repository (https://github.com/edd426/padlock_challenge_edu)
- Git command line tools

## Step 1: Authenticate with Azure

First, ensure you're logged in to Azure:

```bash
az login
```

This will open a browser window. Sign in with your Azure credentials and return to the terminal.

Verify you're logged in:
```bash
az account show
```

## Step 2: Create Azure Resources

Run the following commands to create all necessary Azure resources:

### Create Resource Group
```bash
az group create \
  --name rg-padlock-challenge \
  --location eastus
```

### Create Storage Account
```bash
az storage account create \
  --name stpadlockchallenge \
  --resource-group rg-padlock-challenge \
  --location eastus \
  --sku Standard_LRS
```

### Create Storage Table
```bash
az storage table create \
  --name challenges \
  --account-name stpadlockchallenge
```

### Get Storage Connection String (Save this for Step 4!)
```bash
az storage account show-connection-string \
  --name stpadlockchallenge \
  --resource-group rg-padlock-challenge \
  --output tsv
```

**IMPORTANT**: Copy the output connection string - you'll need it in Step 4.

### Create App Service Plan
```bash
az appservice plan create \
  --name plan-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --sku B1 \
  --is-linux
```

### Create Web App
```bash
az webapp create \
  --name app-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --plan plan-padlock-challenge \
  --runtime "NODE|18-lts"
```

### Configure Initial Settings
```bash
az webapp config appsettings set \
  --name app-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --settings AZURE_STORAGE_CONNECTION_STRING="<connection_string_from_step_2d>"
```

Replace `<connection_string_from_step_2d>` with the connection string you saved from Step 2d.

## Step 3: Get Publish Profile

Get the publish profile for GitHub Actions deployment:

```bash
az webapp deployment list-publishing-profiles \
  --name app-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --xml
```

This outputs XML content. **Copy the entire output** - you'll need it in Step 4a.

## Step 4: Add GitHub Secrets

GitHub Secrets are used by GitHub Actions to authenticate with Azure. You'll add two secrets:

### Step 4a: Add Azure Publish Profile Secret

1. Go to your GitHub repository: https://github.com/edd426/padlock_challenge_edu
2. Click **Settings** (top right)
3. Click **Secrets and variables** → **Actions** (left sidebar)
4. Click **New repository secret**

**First Secret:**
- **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
- **Value**: Paste the entire XML output from Step 3
- Click **Add secret**

### Step 4b: Add Storage Connection String Secret

1. Click **New repository secret** again

**Second Secret:**
- **Name**: `AZURE_STORAGE_CONNECTION_STRING`
- **Value**: Paste the connection string from Step 2d
- Click **Add secret**

## Step 5: Push to GitHub

Commit and push the latest code to GitHub:

```bash
git add .github/workflows/azure-deploy.yml
git commit -m "Add GitHub Actions Azure deployment workflow"
git push origin main
```

This will trigger the GitHub Actions workflow automatically!

## Step 6: Monitor Deployment

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see "Deploy to Azure App Service" workflow running
4. Click on the workflow to see real-time logs
5. Wait for it to complete (usually 2-3 minutes)

If the deployment succeeds, you'll see a green checkmark.

## Step 7: Access Your Deployed App

Once deployed successfully, your app is live at:

```
https://app-padlock-challenge.azurewebsites.net
```

Test the app:
1. Visit the URL in your browser
2. Click "Setup" button
3. Enter password: `swordfish`
4. Make a small change to a lock question
5. Click "Save to Cloud"
6. Go back to challenge mode
7. Refresh the page
8. Verify the change appears

## Step 8: Create Student Access Materials

### Option A: QR Code
1. Visit: https://qr-code-generator.com
2. Enter URL: `https://app-padlock-challenge.azurewebsites.net`
3. Generate and download the QR code
4. Print or display for students to scan

### Option B: URL Shortener
1. Visit: https://bit.ly
2. Enter long URL: `https://app-padlock-challenge.azurewebsites.net`
3. Create short link (e.g., `https://bit.ly/padlock-challenge`)
4. Share the short URL with students

### Option C: Google Classroom
1. Create a new assignment in Google Classroom
2. Add the full URL in the instructions
3. Students click the link to access

## Troubleshooting

### Deployment Failed
Check GitHub Actions logs for errors:
1. Go to **Actions** tab
2. Click the failed workflow
3. Click the **build-and-deploy** job
4. Scroll through logs to find the error message
5. Common issues:
   - Secrets not set correctly → Re-check Step 4
   - Invalid connection string → Copy from Step 2d again
   - App settings not configured → Run Step 2e again

### Can't Access the App URL
- Wait 2-3 minutes after deployment completes
- Try clearing your browser cache
- Use a private/incognito window
- Check that app status is "Running" in Azure Portal

### API Not Working
- Ensure Azure Table Storage connection string is set
- Verify table "challenges" exists in storage account
- Check app logs in Azure Portal → App Service → Logs

## Future Deployments

After the initial setup, every time you:
1. Make code changes
2. Commit to GitHub
3. Push to `main` branch

The GitHub Actions workflow automatically:
- Builds the app
- Runs tests (if any)
- Deploys to Azure
- Configures environment variables

No additional steps needed!

## Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

```bash
# Build the app
npm run build

# Deploy using Azure CLI
az webapp deployment source config-zip \
  --name app-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --src <path-to-zip-file>
```

## Monitoring & Maintenance

### View App Logs
```bash
az webapp log tail \
  --name app-padlock-challenge \
  --resource-group rg-padlock-challenge
```

### Check Resource Costs
Visit Azure Portal → Resource Groups → rg-padlock-challenge → Cost Analysis

Estimated monthly cost: **$13-15**
- App Service B1: ~$13/month
- Table Storage: ~$0.50-1/month

### Scale Up (If Needed)
If you need more performance:
```bash
az appservice plan update \
  --name plan-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --sku S1
```

(This increases cost to ~$75/month)

## Support

For issues or questions:
- Check GitHub Issues: https://github.com/edd426/padlock_challenge_edu/issues
- Review Azure documentation: https://docs.microsoft.com/en-us/azure/app-service/
- Check deployment logs in GitHub Actions

---

**Successfully deployed?** 🎉

Share the URL with your students and start using the Math Padlock Challenge!
