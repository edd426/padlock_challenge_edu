# Deployment Guide - Math Padlock Challenge to Azure Static Web Apps

This guide walks through deploying the Math Padlock Challenge to Azure using **Azure Static Web Apps** with GitHub Actions CI/CD.

## Architecture Note

**Deployment Model**: Azure Static Web Apps + Table Storage (Updated from original App Service plan)
**Reason**: Provides free hosting tier (sufficient for classroom use), better Next.js support, no VM quota restrictions
**Cost**: ~$0.50-1.50/month (vs ~$13/month with App Service)

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

**IMPORTANT**: Copy the entire output connection string - you'll need it in Step 4b.

## Step 3: Create Static Web App via Azure Portal

The easiest way to create and deploy a Static Web App is through GitHub integration in the Azure Portal.

1. Go to Azure Portal: https://portal.azure.com
2. Search for "Static Web Apps" in the search bar
3. Click "+ Create"
4. Fill in the Basic details:
   - **Resource Group**: `rg-padlock-challenge`
   - **Name**: `app-padlock-challenge`
   - **Plan type**: `Free`
   - **Region**: `East US`
5. Click "Sign in with GitHub"
   - You'll be prompted to authorize Azure
   - Authorize the connection
6. Fill in GitHub details:
   - **Organization**: Select your GitHub account
   - **Repository**: `padlock_challenge_edu`
   - **Branch**: `main`
7. Configure build details:
   - **Build Presets**: `Next.js`
   - **App location**: `/`
   - **API location**: `api`
   - **Build output location**: `.next`
8. Click "Review + Create"
9. Click "Create"

Azure will automatically:
- Create the Static Web App resource
- Create a GitHub Actions workflow in your repo
- Deploy your app on the first push

Wait 5-10 minutes for the initial deployment to complete.

## Step 4: Add Environment Variables

Once the Static Web App is created, you need to add the Azure Storage connection string as an environment variable.

### Via Azure Portal:
1. Go to Azure Portal: https://portal.azure.com
2. Navigate to your Static Web App: `app-padlock-challenge`
3. Click "Configuration" in the left sidebar
4. Click "+ Add"
5. Add environment variables:
   - **Name**: `AZURE_STORAGE_CONNECTION_STRING`
   - **Value**: Paste the connection string from Step 2 (the full string output)
   - Click "OK"
6. Click "Save" to confirm

### Redeploy after adding environment variables:
```bash
# Make a small change and push to trigger redeployment
echo "# Updated" >> README.md
git add README.md
git commit -m "Trigger redeployment"
git push origin main
```

## Step 5: Access Your Deployed App

Once deployment completes (check GitHub Actions for status):

Your app is live at:
```
https://app-padlock-challenge.azurestaticapps.net
```

Test the app:
1. Visit the URL in your browser
2. You should see the Math Padlock Challenge
3. Click "Setup" button
4. Enter password: `swordfish`
5. Make a small change to test
6. Click "Save to Cloud"
7. Go back to challenge mode
8. Refresh the page
9. Verify the change appears

## Step 6: Monitor Deployment

Watch the GitHub Actions workflow:

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see "Azure Static Web Apps CI/CD" workflow
4. Click on the workflow run to see real-time logs
5. Wait for it to complete (usually 2-3 minutes)

If deployment succeeds, you'll see a green checkmark.

## Step 7: Create Student Access Materials

### Option A: QR Code (Easiest for Chromebooks)
1. Visit: https://qr-code-generator.com
2. Enter URL: `https://app-padlock-challenge.azurestaticapps.net`
3. Generate and download QR code
4. Print or display for students to scan with their Chromebooks

### Option B: URL Shortener
1. Visit: https://bit.ly
2. Enter long URL: `https://app-padlock-challenge.azurestaticapps.net`
3. Create short link (e.g., `https://bit.ly/padlock-challenge`)
4. Display the short URL on your board

### Option C: Google Classroom
1. Create a new assignment/material in Google Classroom
2. Add the full URL in the instructions
3. Students click the link to access

## Step 8: Ongoing Updates

After the initial setup, deployment is fully automated!

Every time you:
1. Make code changes
2. Commit to GitHub
3. Push to `main` branch

GitHub Actions automatically:
- Builds the app
- Runs tests
- Deploys to Azure Static Web Apps
- Updates environment variables

**No additional steps needed!**

## Troubleshooting

### Deployment Failed
Check GitHub Actions logs:
1. Go to GitHub repository → Actions tab
2. Click the failed workflow
3. Click "build_and_deploy" job
4. Scroll through logs to find the error
5. Common issues:
   - Missing build configuration → Check `.github/workflows/`
   - Node version mismatch → Check build preset in Static Web App config
   - Environment variables → Check they're set in Azure Portal

### App Won't Load
- Wait 5 minutes after deployment completes
- Try clearing browser cache
- Check URL is correct: `https://app-padlock-challenge.azurestaticapps.net`
- Check GitHub Actions shows successful deployment (green checkmark)

### API Not Working
- Verify environment variables are set in Azure Portal Configuration
- Check Azure Storage connection string is correct
- Verify Storage Table "challenges" exists
- Check Azure Storage account is in same resource group

### Can't Save Challenges
- Verify password is correct ("swordfish")
- Check network tab in browser developer tools for API errors
- Ensure AZURE_STORAGE_CONNECTION_STRING environment variable is set
- Test connection string is valid (should contain AccountName and AccountKey)

## Monitoring & Costs

### View App Performance
Azure Portal → Static Web App → Monitoring

### Check Resource Costs
Azure Portal → Resource Groups → rg-padlock-challenge → Cost Analysis

**Estimated monthly cost:**
- Static Web App (free tier): $0
- Table Storage (minimal usage): ~$0.50-1/month
- **Total: ~$0.50-1.50/month**

The free tier is perfect for:
- Up to 100 GB monthly bandwidth
- Up to 250,000 monthly API requests
- One static web app per free tier
- CDN included

### If You Need More:
- Upgrade Static Web App to Standard tier (~$10-50/month)
- Better for production use with higher traffic

## Custom Domain (Optional)

To use a custom domain (e.g., `mathchallenge.com`):

1. Register domain (GoDaddy, Namecheap, etc.) - ~$12/year
2. In Azure Portal → Static Web App → Custom domains
3. Add your domain
4. Update DNS records at your domain registrar
5. Verify ownership

## Support

For issues:
- Check GitHub Issues: https://github.com/edd426/padlock_challenge_edu/issues
- Review Azure documentation: https://docs.microsoft.com/en-us/azure/static-web-apps/
- Check deployment logs in GitHub Actions

---

**Successfully deployed?** 🎉

Share the URL with your students and start using the Math Padlock Challenge!
