# Math Padlock Challenge

An interactive educational web app where students solve math problems to unlock virtual padlocks. Teachers can remotely configure challenges, and students access the app via their Chromebooks.

**🚀 Live Demo**: https://gentle-field-08c20650f.3.azurestaticapps.net

**⚠️ Status**: Currently in development with 3 known issues (see [Known Issues](#known-issues) below)

## Features

- **Interactive Padlock UI**: Realistic SVG padlocks with smooth animations
- **Password-Protected Admin**: Teachers use a password to access setup mode
- **Cloud-Based Configuration**: Save challenges to Azure Table Storage
- **Real-Time Rendering**: Shows masked input (asterisks) while students solve
- **Celebration Reward**: Animated capybara when all locks are unlocked
- **Responsive Design**: Works perfectly on Chromebooks and tablets

## Known Issues

⚠️ **BLOCKING ISSUES** (See [GitHub Issues](https://github.com/edd426/padlock_challenge_edu/issues)):

1. **[#2] Password Modal Not Working** - Cannot access Setup mode to test cloud sync
2. **[#3] Missing Styles** - App has no CSS styling in production
3. **[#1] Missing IaC** - Infrastructure created manually (see Plan: Infrastructure as Code)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Azure account (for production deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/edd426/padlock_challenge_edu.git
   cd padlock_challenge_edu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local` file**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Azure credentials (optional for local testing)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000` in your browser

### Local Testing

- **Student View**: Default page shows challenge mode
- **Setup Mode**: Click "Setup" button, enter password: `swordfish`
- **Add/Edit Locks**: Modify lock names, questions, and correct codes
- **Reset**: Click "Reset" button to re-lock all locks

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main challenge component
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Global styles and animations
│   └── api/
│       └── challenge/
│           └── route.ts      # GET/POST API endpoints
├── components/
│   └── Padlock.tsx           # Padlock SVG component
└── lib/
    ├── types.ts              # TypeScript interfaces
    └── azure.ts              # Azure Table Storage client
```

## API Routes

### GET `/api/challenge`
Fetches the currently active challenge configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "locks": [...],
    "lastUpdated": "2025-10-20T10:30:00Z"
  }
}
```

### POST `/api/challenge`
Saves a challenge configuration (password-protected).

**Headers Required:**
- `x-admin-password: swordfish`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "locks": [...]
}
```

## Deployment

See `PROJECT_PLAN.md` for complete deployment instructions, including:
- Azure resource creation via Azure CLI
- GitHub Actions CI/CD setup
- Environment configuration
- Production URL access

## Security

- **Password Protection**: Admin access requires correct password
- **HTTPS**: All production connections are encrypted
- **No Student Auth**: Anonymous access by design (classroom setting)
- **Environment Variables**: Sensitive config never committed to Git

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: Azure Table Storage
- **Hosting**: Azure App Service
- **CI/CD**: GitHub Actions

## Documentation

- `PROJECT_PLAN.md` - Architecture and deployment strategy
- `CLAUDE.md` - Development guidelines for future maintainers
- `docs/reference/` - Original React component and design history

## License

MIT License - See LICENSE file for details
