# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an educational math padlock challenge game for classroom use. The project has been migrated from a single React component to a full-stack Next.js application with Azure cloud backend.

**Current State**: Deployed to Azure Static Web Apps
**Live URL**: https://gentle-field-08c20650f.3.azurestaticapps.net

**⚠️ Known Issues** (See [GitHub Issues](https://github.com/edd426/padlock_challenge_edu/issues)):
1. [#2] Password Modal Not Working - Cannot access Setup mode
2. [#3] Missing Styles - No CSS styling in production
3. [#1] Missing IaC - Infrastructure created manually instead of via code

## Project Architecture (Planned)

### Migration Path
The codebase is in **transition** from a single-file React component to a full-stack Next.js application. See `PROJECT_PLAN.md` for complete architectural details.

**Planned Stack:**
- **Frontend**: Next.js 13+ with App Router
- **Backend**: Next.js API Routes
- **Database**: Azure Table Storage (key-value store)
- **Hosting**: Azure App Service (Basic B1 tier)
- **Budget**: ~$13-15/month

### Key Architectural Decisions
1. **Single Active Challenge Model**: Only one challenge configuration stored at a time (PartitionKey: "active", RowKey: "current")
2. **Manual Refresh Pattern**: Students manually refresh browser to see updated challenges (no real-time WebSockets)
3. **Anonymous Access**: No student authentication or progress tracking
4. **Password-Protected Admin**: Teacher uses password ("swordfish" by default) to access setup mode

### Planned Project Structure
```
src/
├── app/
│   ├── page.tsx                    # Main challenge page (migrated from math-padlock-game.tsx)
│   ├── layout.tsx                  # Root layout
│   └── api/
│       └── challenge/
│           └── route.ts            # GET/POST endpoints for challenge CRUD
├── components/
│   ├── Padlock.tsx                 # Extracted padlock component with animations
│   ├── ChallengeView.tsx           # Student-facing view
│   └── SetupView.tsx               # Teacher admin view
├── lib/
│   ├── azure.ts                    # Azure Table Storage client wrapper
│   └── types.ts                    # TypeScript types (Lock, Challenge)
└── styles/
    └── globals.css
```

## Current Component Structure

`math-padlock-game.tsx` contains:
- **Padlock Component**: Realistic padlock SVG with shackle animation
- **Two Modes**:
  - `play` mode (default): Student-facing challenge view
  - `setup` mode: Password-protected teacher configuration
- **State Management**:
  - `locks`: Array of lock objects (id, name, question, code, digits, unlocked)
  - `attempts`: User input attempts keyed by lock ID
  - `wrongAttempts`: Tracks failed attempts for shake animation
- **Key Features**:
  - Password prompt modal for setup access
  - Masked input (shows asterisks for attempts, X's for empty)
  - Shake animation on wrong code
  - Capybara celebration SVG when all locks unlocked

## Data Model

### Lock Object
```typescript
{
  id: number              // Unique identifier
  name: string            // Display name (e.g., "Lock 1")
  question: string        // Math problem text
  code: string            // Correct numeric code
  digits: number          // Length of code (1-6)
  unlocked: boolean       // Current state
}
```

### Challenge Object (Planned for API)
```typescript
{
  locks: Lock[]           // Array of lock configurations
  lastUpdated?: string    // ISO timestamp
}
```

## API Design (Planned)

### GET /api/challenge
Fetches the active challenge configuration from Azure Table Storage.

**Response:**
```json
{
  "locks": [...],
  "lastUpdated": "2025-10-20T10:30:00Z"
}
```

### POST /api/challenge
Saves challenge configuration (password-protected).

**Headers Required:**
- `x-admin-password`: "swordfish" (or environment variable)

**Request Body:**
```json
{
  "locks": [...]
}
```

## Azure Resources

When deployed, the application uses these Azure resources (see `PROJECT_PLAN.md` for creation commands):

- **Resource Group**: `rg-padlock-challenge`
- **Storage Account**: `stpadlockchallenge`
  - **Table**: `challenges`
- **App Service Plan**: `plan-padlock-challenge` (Basic B1)
- **Web App**: `app-padlock-challenge`
  - **URL**: `https://[app-name].azurewebsites.net`

## Environment Variables

### Local Development
```bash
AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true"  # For Azurite
# OR
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=..."
```

### Production (Azure App Service)
Set via Azure CLI or Portal:
- `AZURE_STORAGE_CONNECTION_STRING`: Full Azure Storage connection string

## Migration Workflow

When converting the existing component to Next.js:

1. **Preserve All UI/UX**: Keep animations, capybara reward, input masking, colors, layouts
2. **Extract Components**: Split `math-padlock-game.tsx` into modular components
3. **Add API Integration**:
   - Load initial challenge from `GET /api/challenge` on mount
   - Save challenge via `POST /api/challenge` from setup mode
4. **Add Loading States**: Show spinners/loading states during API calls
5. **Error Handling**: Gracefully handle network failures

## Key Constraints

- **No Real-Time Sync**: Students must manually refresh to see updates (cost constraint)
- **Single Challenge Only**: No challenge library or history (v1 scope)
- **No Student Auth**: Anonymous access by design
- **Password in Code**: Admin password is hardcoded (acceptable for classroom use)
- **Budget**: Keep monthly Azure costs under $15

## UI/UX Requirements

- **Padlock Animation**: Shackle swings open when unlocked (CSS transform + transition)
- **Wrong Attempt Feedback**: Red background + shake animation (500ms duration)
- **Input Masking**: Show `*` for entered digits, `X` for empty positions
- **Capybara Celebration**: SVG capybara with bounce animation when all locks unlocked
- **Responsive Design**: Must work on Chromebooks (small screens, touch-friendly)
- **Password Modal**: UI-based password prompt (not browser alert)

## Testing Checklist

Before considering migration complete:
- [ ] All existing animations still work
- [ ] Password protection functions in both frontend and backend
- [ ] API successfully saves to Azure Table Storage
- [ ] API successfully retrieves from Azure Table Storage
- [ ] Students can refresh to see updated challenges
- [ ] App works on Chrome (primary Chromebook browser)
- [ ] Mobile/tablet responsive layout works
- [ ] Capybara appears when all locks unlocked

## Deployment

See `PROJECT_PLAN.md` Section "Deployment Steps" for:
- Azure CLI commands to create resources
- Environment variable configuration
- Build and deployment process
- GitHub Actions CI/CD setup (optional)

## Student Access Methods

The deployed app will be accessed by students via:
1. **QR Code**: Generated from final Azure URL
2. **URL Shortener**: bit.ly or similar for easy typing
3. **Google Classroom**: Posted link for one-click access
4. **Chromebook Bookmarks**: Pre-configured by IT

Default Azure URL format: `https://[app-name].azurewebsites.net`

## Security Model

- **Teacher Auth**: Password checked in both frontend (UX) and backend (security)
- **API Protection**: POST endpoint requires `x-admin-password` header
- **No Student Auth**: Anonymous access by design
- **HTTPS**: Automatic with Azure App Service
- **Sufficient For**: Small classroom use (20-30 students), low-stakes educational tool

## Future Enhancements (Out of V1 Scope)

These are explicitly **not** part of initial implementation:
- Challenge library (save multiple challenges)
- Student progress tracking
- Real-time updates via SignalR
- Analytics dashboard
- Custom reward messages/images
- Mobile native apps

Refer to `PROJECT_PLAN.md` "Future Enhancements" section for effort estimates.

## Development Notes

- **Preserve Existing Features**: The current `math-padlock-game.tsx` is fully functional and user-tested. Do not remove or break existing functionality during migration.
- **Component Extraction**: When splitting the monolithic component, maintain the exact same visual appearance and behavior.
- **Azure SDK**: Use `@azure/data-tables` package for Table Storage operations.
- **Next.js Version**: Use Next.js 13+ with App Router (not Pages Router).
- **TypeScript**: Project should use TypeScript for type safety.
- **Styling**: Continue using Tailwind CSS classes (already in existing component).

## References

- **PROJECT_PLAN.md**: Complete technical architecture, cost estimates, phase-by-phase implementation plan
- **initatial_creation_transcript.md**: Historical context of how the React component was built
- **math-padlock-game.tsx**: Current working implementation (all features functional)
