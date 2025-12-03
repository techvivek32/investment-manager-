# Investment & Business Listing Platform

A complete full-stack web application for managing business investments with role-based access control (RBAC). Built with Next.js, MongoDB, and NextAuth.js.

## Features

### Admin Features
- Create and manage users with role assignments
- Review and approve/reject business listings
- Control business visibility to investors
- Track all investments and analytics

### Business Owner Features
- Create and manage business listings
- Upload business documents and proofs
- Set investment terms (min/max amounts, expected returns)
- Pin business location on map
- Track investments in their businesses

### Investor Features
- Browse approved businesses assigned to them
- View business details and documents
- Make investments within specified ranges
- Track their portfolio and investments

## Tech Stack

- **Frontend & Backend**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js v5 with JWT
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel-ready

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- MongoDB database (Atlas or local)
- npm or yarn package manager

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

\`\`\`env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investment_platform?retryWrites=true&w=majority

# NextAuth.js Configuration
NEXTAUTH_SECRET=your-super-secret-jwt-key-min-32-chars-replace-this
NEXTAUTH_URL=http://localhost:3000

# File Upload
UPLOAD_DIR=./public/uploads

# App Settings
NEXT_PUBLIC_APP_NAME=Investment Platform
NEXT_PUBLIC_MAP_PROVIDER=leaflet
\`\`\`

### 3. Installation

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 4. Database Setup

The Mongoose models will automatically create collections on first connection. To ensure indexes are created:

\`\`\`bash
npm run dev
\`\`\`

Then visit `http://localhost:3000` and the models will initialize.

### 5. Create Demo Users (Optional)

Create test users through the API:

\`\`\`bash
# Admin
POST http://localhost:3000/api/admin/users
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123",
  "role": "admin"
}

# Business Owner
POST http://localhost:3000/api/admin/users
{
  "name": "Business Owner",
  "email": "owner@example.com",
  "password": "password123",
  "role": "business_owner"
}

# Investor
POST http://localhost:3000/api/admin/users
{
  "name": "Investor",
  "email": "investor@example.com",
  "password": "password123",
  "role": "investor"
}
\`\`\`

### 6. Running the Application

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

\`\`\`
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── admin/             # Admin-only endpoints
│   │   ├── businesses/        # Business management
│   │   ├── investments/       # Investment tracking
│   │   └── owner/             # Owner endpoints
│   ├── admin/                 # Admin pages
│   ├── owner/                 # Business owner pages
│   ├── investor/              # Investor pages
│   ├── login/                 # Authentication page
│   ├── dashboard/             # Role-based redirect
│   └── layout.tsx             # Root layout
├── lib/
│   ├── db/                    # Database utilities
│   │   ├── mongoose.ts        # MongoDB connection
│   │   └── auth.ts            # Auth helpers
│   ├── models/                # Mongoose models
│   │   ├── User.ts
│   │   ├── Business.ts
│   │   ├── Document.ts
│   │   ├── BusinessVisibility.ts
│   │   └── Investment.ts
│   ├── middleware/            # Auth middleware
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── middleware.ts              # NextAuth middleware
└── .env.local                 # Environment variables
\`\`\`

## API Documentation

### Authentication

- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session

### Users (Admin Only)

- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

### Businesses

- `GET /api/businesses` - List (owners: own, admin: all)
- `POST /api/businesses` - Create (owner only)
- `GET /api/businesses/[id]` - Get detail
- `PATCH /api/businesses/[id]` - Update (owner only)
- `PATCH /api/admin/businesses/[id]/status` - Approve/reject (admin only)
- `GET /api/investor/businesses` - List visible businesses (investor only)

### Documents

- `GET /api/businesses/[id]/documents` - List documents
- `POST /api/businesses/[id]/documents` - Upload document (owner only)

### Business Visibility

- `GET /api/admin/visibility` - List all assignments
- `POST /api/admin/visibility` - Assign business to investor

### Investments

- `GET /api/investments` - List (based on role)
- `POST /api/investments` - Create investment (investor only)

## Authentication & Authorization

The application uses **NextAuth.js** with JWT for authentication and custom middleware for authorization:

- **Login**: Credentials-based authentication
- **Session**: JWT stored in secure cookies
- **Role-Based Access**: Enforced at middleware and API level
- **Route Protection**: Automatic redirection based on role

### Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Create/manage users, approve businesses, control visibility, view all data |
| **Business Owner** | Create/manage own businesses, upload documents, view own investments |
| **Investor** | View assigned businesses, make investments, track portfolio |

## Security Considerations

- Passwords hashed with bcryptjs
- JWT stored in HTTP-only cookies
- Role-based route protection via middleware
- Row-level security for MongoDB queries
- Input validation on all endpoints
- CORS-ready for frontend/backend separation

## File Upload Handling

Currently configured for local file storage. To upgrade to cloud storage:

1. **AWS S3**: Use `aws-sdk` and store file URLs in MongoDB
2. **Vercel Blob**: Integrate with Vercel Blob storage
3. **Cloudinary**: Use Cloudinary SDK for image handling

Example S3 integration available upon request.

## Database Models

### User
\`\`\`typescript
- _id: ObjectId
- name: string
- email: string (unique)
- passwordHash: string
- role: 'admin' | 'business_owner' | 'investor'
- isActive: boolean
- timestamps
\`\`\`

### Business
\`\`\`typescript
- _id: ObjectId
- ownerId: ObjectId (ref: User)
- name: string
- description: string
- category: string
- latitude/longitude: number
- status: 'pending' | 'approved' | 'rejected'
- minInvestmentAmount: number
- maxInvestmentAmount: number
- expectedReturnPercentage: number
- documents: ObjectId[] (ref: Document)
- timestamps
\`\`\`

### Document
\`\`\`typescript
- _id: ObjectId
- businessId: ObjectId (ref: Business)
- fileName: string
- fileUrl: string
- documentType: string
- uploadedAt: Date
\`\`\`

### BusinessVisibility
\`\`\`typescript
- _id: ObjectId
- investorId: ObjectId (ref: User)
- businessId: ObjectId (ref: Business)
- createdAt: Date (unique composite index)
\`\`\`

### Investment
\`\`\`typescript
- _id: ObjectId
- investorId: ObjectId (ref: User)
- businessId: ObjectId (ref: Business)
- amount: number
- status: 'pending' | 'confirmed' | 'cancelled'
- createdAt: Date
\`\`\`

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables:
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (production URL)

4. Deploy

\`\`\`bash
vercel --prod
\`\`\`

### Environment Variables (Production)

\`\`\`env
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=Investment Platform
NEXT_PUBLIC_MAP_PROVIDER=leaflet
\`\`\`

## Development Tips

### Debugging

Enable debug logging by setting `DEBUG=nextauth:*` before running:

\`\`\`bash
DEBUG=nextauth:* npm run dev
\`\`\`

### Database Queries

Use MongoDB Compass to inspect collections and debug queries.

### API Testing

Use Postman or cURL to test API endpoints:

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
\`\`\`

## Future Enhancements

- [ ] Email notifications for business approvals
- [ ] Advanced analytics dashboard
- [ ] Payment processing (Stripe integration)
- [ ] Real-time notifications with WebSockets
- [ ] Document digitization and verification
- [ ] Smart contract integration for escrow
- [ ] Mobile app (React Native)
- [ ] Advanced search and filtering

## License

MIT

## Support

For issues or questions:
1. Check the API documentation above
2. Review error logs in the browser console
3. Check MongoDB connection in env variables
4. Verify NextAuth.js configuration

---

**Built with ❤️ using Next.js, MongoDB, and TypeScript**
