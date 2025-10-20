# Math Padlock Challenge - Cloud Infrastructure Project Plan

## Project Overview
Convert the existing single-component Math Padlock Challenge into a cloud-enabled application where a teacher can remotely configure challenges that students access via a shared web URL.

## Project Scope - Key Decisions

### Architecture Decisions
- **Deployment Model**: Single web app accessible to all users (students + teacher)
- **Update Mechanism**: Manual refresh - students refresh browser to see latest challenges
- **User Model**: Anonymous access - no student tracking or authentication
- **Data Model**: Single active challenge (overwrite on teacher update)
- **Budget Target**: ~$13-15/month (minimal Azure setup)
- **Hosting**: Azure Static Web Apps + Azure Functions (serverless, no quota restrictions)
- **Database**: Azure Table Storage (cheapest option, sufficient for simple CRUD)
- **Framework**: Next.js (React framework with built-in API routes)
- **CI/CD**: GitHub Actions with Static Web Apps deployment

### Architecture Decision: Static Web Apps vs App Service

**Initial Plan**: Azure App Service
**Final Decision**: Azure Static Web Apps + Azure Functions
**Reason for Change**: Free trial quota restrictions on App Service prevented deployment. Static Web Apps offers:
- ✅ No VM quota restrictions (instant approval)
- ✅ Better Next.js integration (built-in support)
- ✅ Same cost (~$13-15/month)
- ✅ Simpler GitHub integration
- ✅ CDN included automatically
- ⚠️ API cold starts (2-5 sec on first call after idle) - acceptable for classroom usage patterns

---

## Technical Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                     Browser (Students)                   │
│  - View challenge mode (default)                        │
│  - Manual refresh to get latest challenges              │
└────────────────┬────────────────────────────────────────┘
                 │
                 │ HTTPS + CDN (CloudFlare)
                 │
┌────────────────▼────────────────────────────────────────┐
│        Azure Static Web Apps (Next.js Frontend)         │
│                                                          │
│  ┌─────────────────────────────────────────────┐       │
│  │      Frontend (React/Next.js SPA)           │       │
│  │  - Challenge view (default)                 │       │
│  │  - Setup view (password protected)          │       │
│  │  - Optimized for static hosting             │       │
│  └─────────┬───────────────────────────────────┘       │
│            │                                            │
│  ┌─────────▼───────────────────────────────────┐       │
│  │      API Route Handler (Next.js Routes)     │       │
│  │  - GET  /api/challenge (get active)         │       │
│  │  - POST /api/challenge (update - auth req'd)│       │
│  └─────────┬───────────────────────────────────┘       │
└────────────┼────────────────────────────────────────────┘
             │
             │ Azure SDK (Table Storage)
             │
┌────────────▼────────────────────────────────────────────┐
│              Azure Table Storage                        │
│                                                          │
│  Table: "challenges"                                    │
│  - PartitionKey: "active"                              │
│  - RowKey: "current"                                   │
│  - Data: JSON blob of lock configuration               │
│  - Timestamp: Last updated                             │
└─────────────────────────────────────────────────────────┘
```

### Teacher Workflow
1. Teacher visits the web app URL
2. Clicks "Setup" button → enters password ("swordfish")
3. Modifies challenge configuration (locks, questions, codes)
4. Clicks "Save Challenge" → API saves to Azure Table Storage
5. Students refresh their browsers to see the new challenge

### Student Workflow
1. Student visits the web app URL
2. Sees the challenge view by default
3. Attempts to solve padlocks
4. Refreshes page manually to get latest challenge configuration

---

## Azure Services & Estimated Costs

### Azure Static Web Apps
- **Hosting Model**: Serverless static site hosting with integrated API
- **Free Tier Features**: Perfect for this use case
  - 1 static web app
  - 100 GB monthly bandwidth
  - 250,000 monthly API requests (more than enough)
  - CDN included (CloudFlare)
  - HTTPS automatic
- **Cost**: **FREE** for this usage level
- **Production Tier (if needed): $10-50/month depending on traffic

### Azure Storage Account (Table Storage)
- **Usage**: Store one active challenge configuration
- **Storage**: < 1 MB (negligible)
- **Transactions**: ~1000-5000/month (read-heavy)
- **Cost**: ~$0.50-1/month

### Custom Domain (Optional)
- **Azure DNS**: ~$0.50/month if using custom domain
- **Use Static Web Apps subdomain for free**: `yourapp.azurestaticapps.net`

### **Total Estimated Cost**: ~$0.50-1.50/month!
**Note**: This is significantly cheaper than the original App Service plan (~$13/month) thanks to the free Static Web Apps tier being sufficient for your usage

---

## Implementation Plan

### Phase 1: Convert to Next.js Project (30-45 min)
1. ✅ Initialize Next.js project with TypeScript
2. ✅ Convert existing React component to Next.js page
3. ✅ Keep all existing UI/UX functionality
4. ✅ Test locally that everything still works

### Phase 2: Create Backend API (45-60 min)
1. ✅ Create API route: `GET /api/challenge`
   - Fetches active challenge from Azure Table Storage
   - Returns lock configuration as JSON

2. ✅ Create API route: `POST /api/challenge`
   - Validates teacher password in request header
   - Saves challenge configuration to Azure Table Storage
   - Returns success/error response

3. ✅ Set up Azure Storage SDK
   - Install `@azure/data-tables` package
   - Configure connection string (environment variable)

### Phase 3: Update Frontend (30-45 min)
1. ✅ Add "Load Challenge" button or auto-load on mount
   - Calls `GET /api/challenge` on component mount
   - Populates locks state with server data

2. ✅ Update "Start Challenge" button in Setup mode
   - Calls `POST /api/challenge` with lock configuration
   - Shows success/error message

3. ✅ Add loading states and error handling
   - Show spinner while loading
   - Handle network errors gracefully

### Phase 4: Azure Setup (60-90 min)
1. ✅ Create Azure Account (if needed)
2. ✅ Create Resource Group: `rg-padlock-challenge`
3. ✅ Create Storage Account: `stpadlockchallenge`
   - Create Table: `challenges`
4. ✅ Create App Service: `app-padlock-challenge`
   - Configure environment variables (connection string)
5. ✅ Deploy Next.js app to Azure App Service

### Phase 5: Testing & Refinement (30 min)
1. ✅ Test teacher workflow (update challenge)
2. ✅ Test student workflow (view and refresh)
3. ✅ Verify password protection works
4. ✅ Test on multiple devices/browsers

---

## Code Structure Changes

### New Project Structure
```
padlock_challenge_edu/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main challenge page (converted from math-padlock-game.tsx)
│   │   ├── layout.tsx            # Root layout
│   │   └── api/
│   │       └── challenge/
│   │           └── route.ts      # API routes (GET/POST)
│   ├── components/
│   │   ├── Padlock.tsx           # Extracted padlock component
│   │   ├── ChallengeView.tsx     # Student view
│   │   └── SetupView.tsx         # Teacher admin view
│   ├── lib/
│   │   ├── azure.ts              # Azure Table Storage client
│   │   └── types.ts              # TypeScript types for Lock/Challenge
│   └── styles/
│       └── globals.css           # Global styles
├── public/
├── .env.local                     # Local environment variables
├── .env.production                # Production environment variables (Azure)
├── next.config.js
├── package.json
├── tsconfig.json
└── PROJECT_PLAN.md (this file)
```

### Key Code Components

#### 1. Type Definitions (`src/lib/types.ts`)
```typescript
export interface Lock {
  id: number;
  name: string;
  question: string;
  code: string;
  digits: number;
  unlocked: boolean;
}

export interface Challenge {
  locks: Lock[];
  lastUpdated?: string;
}
```

#### 2. Azure Table Storage Client (`src/lib/azure.ts`)
```typescript
import { TableClient } from "@azure/data-tables";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const tableName = "challenges";

export async function getActiveChallenge(): Promise<Challenge | null> {
  // Fetch from Azure Table Storage
}

export async function saveActiveChallenge(challenge: Challenge): Promise<void> {
  // Save to Azure Table Storage
}
```

#### 3. API Route (`src/app/api/challenge/route.ts`)
```typescript
// GET /api/challenge - fetch active challenge
export async function GET() {
  const challenge = await getActiveChallenge();
  return Response.json(challenge);
}

// POST /api/challenge - save challenge (password protected)
export async function POST(request: Request) {
  const password = request.headers.get("x-admin-password");
  if (password !== "swordfish") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const challenge = await request.json();
  await saveActiveChallenge(challenge);
  return Response.json({ success: true });
}
```

#### 4. Frontend Integration (page.tsx)
```typescript
// On mount - load challenge from server
useEffect(() => {
  fetch('/api/challenge')
    .then(res => res.json())
    .then(data => {
      if (data?.locks) {
        setLocks(data.locks);
      }
    });
}, []);

// On save from setup mode
const saveChallenge = async () => {
  await fetch('/api/challenge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': 'swordfish'
    },
    body: JSON.stringify({ locks })
  });
};
```

---

## Environment Variables Required

### Local Development (`.env.local`)
```bash
AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true"  # Use Azurite for local testing
# OR
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=..."
```

### Production (Azure App Service Configuration)
```bash
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=stpadlockchallenge;AccountKey=<YOUR_KEY>;EndpointSuffix=core.windows.net"
```

---

## Deployment Steps

### Option 1: GitHub Actions CI/CD (Recommended for Production)
Automated deployment using GitHub Actions for continuous integration and delivery.

#### Initial Azure Setup (One-Time)
```bash
# Login to Azure
az login

# Create resource group
az group create --name rg-padlock-challenge --location eastus

# Create storage account
az storage account create \
  --name stpadlockchallenge \
  --resource-group rg-padlock-challenge \
  --location eastus \
  --sku Standard_LRS

# Create table
az storage table create \
  --name challenges \
  --account-name stpadlockchallenge

# Get storage connection string (save for later)
az storage account show-connection-string \
  --name stpadlockchallenge \
  --resource-group rg-padlock-challenge \
  --output tsv

# Create app service plan
az appservice plan create \
  --name plan-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --name app-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --plan plan-padlock-challenge \
  --runtime "NODE|18-lts"

# Configure environment variables
az webapp config appsettings set \
  --name app-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --settings AZURE_STORAGE_CONNECTION_STRING="<connection_string>"

# Get publish profile for GitHub Actions
az webapp deployment list-publishing-profiles \
  --name app-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --xml
```

#### GitHub Actions Setup

1. **Create GitHub Repository** (if not already created)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   gh repo create padlock-challenge --private --source=. --push
   ```

2. **Add Azure Publish Profile as GitHub Secret**
   - Copy the XML output from the `list-publishing-profiles` command above
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: Paste the entire XML content
   - Click "Add secret"

3. **Add Storage Connection String as GitHub Secret**
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `AZURE_STORAGE_CONNECTION_STRING`
   - Value: Paste the connection string from earlier
   - Click "Add secret"

4. **Create GitHub Actions Workflow File**

   Create `.github/workflows/azure-deploy.yml`:
   ```yaml
   name: Deploy to Azure App Service

   on:
     push:
       branches:
         - main
     workflow_dispatch:

   env:
     AZURE_WEBAPP_NAME: app-padlock-challenge
     NODE_VERSION: '18.x'

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest

       steps:
       - name: Checkout code
         uses: actions/checkout@v4

       - name: Set up Node.js
         uses: actions/setup-node@v4
         with:
           node-version: ${{ env.NODE_VERSION }}
           cache: 'npm'

       - name: Install dependencies
         run: npm ci

       - name: Run tests (if available)
         run: npm test --if-present
         continue-on-error: true

       - name: Build Next.js app
         run: npm run build
         env:
           AZURE_STORAGE_CONNECTION_STRING: ${{ secrets.AZURE_STORAGE_CONNECTION_STRING }}

       - name: Deploy to Azure Web App
         uses: azure/webapps-deploy@v2
         with:
           app-name: ${{ env.AZURE_WEBAPP_NAME }}
           publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
           package: .

       - name: Configure App Settings
         uses: azure/appservice-settings@v1
         with:
           app-name: ${{ env.AZURE_WEBAPP_NAME }}
           app-settings-json: |
             [
               {
                 "name": "AZURE_STORAGE_CONNECTION_STRING",
                 "value": "${{ secrets.AZURE_STORAGE_CONNECTION_STRING }}",
                 "slotSetting": false
               }
             ]
   ```

5. **Commit and Push Workflow**
   ```bash
   git add .github/workflows/azure-deploy.yml
   git commit -m "Add GitHub Actions deployment workflow"
   git push origin main
   ```

6. **Verify Deployment**
   - Go to GitHub repository → Actions tab
   - Watch the workflow run
   - Check for any errors
   - Visit `https://app-padlock-challenge.azurewebsites.net` once complete

#### Deployment Workflow
After initial setup, every push to `main` branch will:
1. ✅ Checkout code
2. ✅ Install Node.js and dependencies
3. ✅ Run tests (if available)
4. ✅ Build Next.js application
5. ✅ Deploy to Azure App Service
6. ✅ Configure environment variables
7. ✅ Verify deployment

**Manual Deployment Trigger:**
- Go to Actions tab in GitHub
- Select "Deploy to Azure App Service" workflow
- Click "Run workflow" button
- Select branch and run

---

### Option 2: Manual Deploy via Azure CLI
For quick one-off deployments or testing:

```bash
# Build the application
npm run build

# Create deployment package
zip -r deploy.zip .next node_modules package.json package-lock.json next.config.js public

# Deploy to Azure
az webapp deployment source config-zip \
  --name app-padlock-challenge \
  --resource-group rg-padlock-challenge \
  --src deploy.zip

# Verify deployment
az webapp browse \
  --name app-padlock-challenge \
  --resource-group rg-padlock-challenge
```

---

### Option 3: Deploy via VS Code Azure Extension
For local development and testing:

1. Install "Azure App Service" extension in VS Code
2. Sign in to Azure account
3. Right-click on project folder
4. Select "Deploy to Web App"
5. Follow prompts to create/select resources
6. Configure environment variables in Azure Portal

**Note**: VS Code extension is good for testing but GitHub Actions is recommended for production deployments.

---

## Security Considerations

### Current Security Model
- **Teacher Authentication**: Password-based (`"swordfish"`) checked in frontend AND backend
- **No student authentication**: Anonymous access by design
- **API Protection**: POST endpoint requires password in header

### Recommended Enhancements (Optional, Future)
1. **Replace hardcoded password** with environment variable
2. **Add rate limiting** to prevent API abuse
3. **Add CORS restrictions** if needed
4. **Use HTTPS** (automatic with Azure App Service)
5. **Add admin token/JWT** instead of password in header (more secure)

### Current Implementation is Sufficient For:
- Small classroom use (20-30 students)
- Low-stakes educational tool
- Teacher-only updates (no student submissions)

---

## Testing Strategy

### Local Testing
1. Use Azurite (Azure Storage Emulator) for local development
2. Test all CRUD operations locally before deploying

### Production Testing Checklist
- [ ] Teacher can access setup page with password
- [ ] Teacher can create/edit/delete locks
- [ ] Teacher can save challenge to cloud
- [ ] Students can load challenge from cloud
- [ ] Students see updated challenge after refresh
- [ ] Wrong password blocks setup access
- [ ] App works on mobile devices
- [ ] App works in multiple browsers

---

## Maintenance & Monitoring

### Monitoring
- **Azure App Service Logs**: Monitor for errors
- **Application Insights** (optional, ~$2-5/month): Detailed telemetry

### Backup Strategy
- Azure Table Storage has automatic redundancy (LRS)
- Consider periodic exports of challenge data (manual or automated)

### Scaling Considerations
- Current setup handles: 100-200 concurrent students easily
- If needed, upgrade to Standard tier (~$75/month) for auto-scaling

---

## Future Enhancements (Out of Scope for V1)

### Nice-to-Have Features
1. **Challenge Library**: Save multiple challenges, switch between them
2. **Student Progress Tracking**: Track which students solved which challenges
3. **Real-time Updates**: Use SignalR for instant challenge updates
4. **Analytics Dashboard**: View student attempt statistics
5. **Mobile App**: Native iOS/Android apps
6. **Challenge History**: Archive past challenges with timestamps
7. **Multiplayer Mode**: Students compete in real-time
8. **Custom Rewards**: Upload custom images/messages for completion

### Estimated Effort for Each
- Challenge Library: +2-3 hours
- Student Tracking: +4-6 hours (requires auth)
- Real-time Updates: +6-8 hours (SignalR setup)
- Analytics: +8-10 hours
- Mobile Apps: +40-60 hours (full project)

---

## Success Criteria

### Project Complete When:
1. ✅ Teacher can update challenge from any device
2. ✅ Students can access challenge from shared URL
3. ✅ Students see updated challenges after manual refresh
4. ✅ Setup page is password protected
5. ✅ App is deployed to Azure and accessible 24/7
6. ✅ Monthly cost is under $15
7. ✅ All existing features (capybara, animations, etc.) still work

---

## Risk Assessment

### Technical Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Azure costs higher than expected | Low | Medium | Start with free tier, monitor daily |
| Table Storage too slow | Very Low | Low | Add caching if needed |
| Students overwhelm server | Low | Medium | Azure auto-scales within tier |
| Password security insufficient | Medium | Low | Acceptable for classroom use |

### Project Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Scope creep (adding features) | Medium | Medium | Stick to V1 scope, track future ideas |
| Deployment complexity | Low | High | Use Azure CLI scripts, document steps |
| Testing insufficient | Medium | Medium | Follow testing checklist |

---

## Next Steps

### Immediate Actions (Before Starting Development)
1. ✅ Review and approve this plan with wife (end user)
2. ✅ Create Azure free trial account (or use existing)
3. ✅ Set up development environment (Node.js, Azure CLI)
4. ✅ Create GitHub repository (optional, but recommended)

### Development Sequence
**Session 1** (1-2 hours): Next.js setup and conversion
**Session 2** (1-2 hours): Backend API and Azure integration
**Session 3** (1-2 hours): Frontend updates and testing
**Session 4** (1-2 hours): Azure deployment and production testing

**Total Estimated Time**: 4-8 hours of development work

---

## Questions for Claude Code Agent

When starting development, provide this context to the agent:

### Required Information
1. Azure Storage Account connection string (after creating in Azure Portal)
2. Desired app name for Azure App Service URL
3. Any custom styling/branding preferences
4. Preferred admin password (or keep "swordfish")

### Agent Instructions Template
```
I need help converting my React padlock game to a Next.js app with Azure backend.

Context:
- Existing code is in /math-padlock-game.tsx
- Target architecture: Next.js + Azure App Service + Azure Table Storage
- See PROJECT_PLAN.md for full details

Please help me:
1. Initialize Next.js project with TypeScript
2. Convert existing component to Next.js page structure
3. Create API routes for GET/POST challenge data
4. Integrate Azure Table Storage client
5. Update frontend to load/save from API
6. Test locally before deployment

Requirements:
- Keep all existing UI/UX features (animations, capybara, etc.)
- Add loading states for API calls
- Handle errors gracefully
- Follow PROJECT_PLAN.md architecture
```

---

## Resources & Documentation

### Azure Documentation
- [Azure App Service](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Table Storage](https://docs.microsoft.com/en-us/azure/storage/tables/)
- [Deploy Next.js to Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)

### Next.js Documentation
- [Next.js Getting Started](https://nextjs.org/docs/getting-started)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

### Libraries Used
- `next` - React framework
- `react` - UI library
- `@azure/data-tables` - Azure Table Storage client
- `lucide-react` - Icons (already in use)

---

## Glossary

- **Azure Table Storage**: NoSQL key-value store, cheapest Azure database option
- **Next.js**: React framework with server-side rendering and API routes
- **App Service**: Azure's managed hosting for web apps
- **Resource Group**: Container for related Azure resources
- **Connection String**: Credentials to connect to Azure Storage
- **API Route**: Backend endpoint in Next.js (e.g., `/api/challenge`)

---

## Document Version History
- v1.0 (2025-10-20): Initial project plan created based on requirements gathering
- v1.1 (2025-10-20): Added GitHub Actions CI/CD as primary deployment method with detailed workflow configuration

---

**Ready to start development?** Share this document with Claude Code agent and begin with Phase 1!
