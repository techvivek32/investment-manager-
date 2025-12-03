# Quick Start Guide

Get the Investment Platform running locally in 5 minutes.

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org))
- npm or yarn
- MongoDB (local or Atlas account)

## 1. Clone & Install

\`\`\`bash
# Clone repository
git clone <your-repo-url>
cd investment-platform

# Install dependencies
npm install
\`\`\`

## 2. Setup Environment

Create `.env.local` in root directory:

\`\`\`env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investment_platform?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=your-secret-key-min-32-chars-replace-this-with-something-random
NEXTAUTH_URL=http://localhost:3000

# App
NEXT_PUBLIC_APP_NAME=Investment Platform
NEXT_PUBLIC_MAP_PROVIDER=leaflet
\`\`\`

## 3. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 4. Login

Use these demo credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Business Owner | owner@example.com | password123 |
| Investor | investor@example.com | password123 |

**Note**: These are examples. Create actual users via admin panel.

## 5. Create Demo Data

1. **As Admin**: Create users and businesses
2. **As Owner**: Create a business listing
3. **As Admin**: Approve the business
4. **As Admin**: Assign business to investor
5. **As Investor**: Invest in the business

## Useful Commands

\`\`\`bash
# Development
npm run dev              # Start dev server

# Production
npm run build           # Build for production
npm start               # Start production server

# Linting & Type Checking
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript check

# Database
# Mongoose auto-creates collections on first connection
# Use MongoDB Atlas UI or Compass to manage data
\`\`\`

## Project Structure Quick Reference

\`\`\`
├── app/
│   ├── api/            # API endpoints
│   ├── admin/          # Admin pages
│   ├── owner/          # Owner pages
│   ├── investor/       # Investor pages
│   └── login/          # Auth page
├── lib/
│   ├── models/         # Mongoose schemas
│   ├── db/             # Database utilities
│   └── middleware/     # Auth middleware
└── .env.local          # Configuration
\`\`\`

## Common Tasks

### Create a Business (as Owner)

1. Login as business owner
2. Go to Dashboard → Create New Business
3. Fill in business details
4. Submit

### Approve a Business (as Admin)

1. Login as admin
2. Go to Businesses tab
3. Click "View Details"
4. Click "Approve" button

### Assign Business to Investor (as Admin)

1. Login as admin
2. Go to Visibility Control
3. Select investor and business
4. Click "Assign"

### Invest in Business (as Investor)

1. Login as investor
2. Browse businesses
3. Click on business
4. Enter investment amount
5. Click "Invest Now"

## Troubleshooting

### Database Connection Failed

1. Verify MongoDB URI in `.env.local`
2. Check MongoDB is running (if local)
3. Verify credentials if using MongoDB Atlas
4. Check IP whitelist if using Atlas

### Port 3000 Already in Use

\`\`\`bash
# Kill process on port 3000
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
\`\`\`

### TypeScript Errors

\`\`\`bash
npm run type-check
\`\`\`

### Build Failures

\`\`\`bash
# Clear build cache
rm -rf .next
npm run build
\`\`\`

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Review API documentation in README.md
- Customize styling in Tailwind CSS

---

**Ready to deploy?** See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup instructions.
