# Architecture Documentation

Technical architecture overview of the Investment Platform.

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Full-Stack App                   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Frontend (React + TypeScript)            │   │
│  │  - Login Page (/login)                               │   │
│  │  - Admin Dashboard (/admin/*)                        │   │
│  │  - Owner Dashboard (/owner/*)                        │   │
│  │  - Investor Dashboard (/investor/*)                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↕                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         API Routes (Next.js Route Handlers)           │   │
│  │  - /api/auth/* (NextAuth)                            │   │
│  │  - /api/admin/* (Admin operations)                   │   │
│  │  - /api/businesses/* (Business management)          │   │
│  │  - /api/investments/* (Investment tracking)         │   │
│  │  - /api/investor/* (Investor access)                │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↕                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Middleware & Business Logic (TypeScript)        │   │
│  │  - Authentication (NextAuth.js)                      │   │
│  │  - Authorization (Role-based)                        │   │
│  │  - Input Validation                                  │   │
│  │  - Error Handling                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↕                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Data Access Layer (Mongoose ODM)             │   │
│  │  - User Model                                        │   │
│  │  - Business Model                                    │   │
│  │  - Document Model                                    │   │
│  │  - Investment Model                                  │   │
│  │  - BusinessVisibility Model                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↕                                  │
└─────────────────────────────────────────────────────────────┘
                             ↕
                  ┌──────────────────┐
                  │  MongoDB Atlas   │
                  │   (Database)     │
                  └──────────────────┘
\`\`\`

## Data Flow

### Authentication Flow

\`\`\`
User Login
    ↓
NextAuth Credentials Provider
    ↓
Validate Email/Password vs MongoDB
    ↓
Create JWT Token
    ↓
Store in Secure Cookie
    ↓
User Session Available
\`\`\`

### Business Creation Flow

\`\`\`
Owner Creates Business
    ↓
POST /api/businesses
    ↓
Auth Middleware (verify owner role)
    ↓
Validate Input
    ↓
Create Document in MongoDB
    ↓
Set status: "pending"
    ↓
Return Business Object
\`\`\`

### Business Approval Flow

\`\`\`
Admin Reviews Business
    ↓
PATCH /api/admin/businesses/{id}/status
    ↓
Auth Middleware (verify admin role)
    ↓
Update Status (pending → approved)
    ↓
Send Notification (optional)
    ↓
Available for Assignment
\`\`\`

### Investment Flow

\`\`\`
Investor Visits Business
    ↓
GET /api/investor/businesses/{id}
    ↓
Check Visibility Record
    ↓
Display Business Details
    ↓
Investor Enters Amount
    ↓
POST /api/investments
    ↓
Validate Amount Range
    ↓
Create Investment Record
    ↓
Update Portfolio
\`\`\`

## Database Schema

### Collections & Indexes

\`\`\`
users (4 indexes)
├── _id (primary)
├── email (unique)
├── role
└── isActive

businesses (3 indexes)
├── _id (primary)
├── ownerId
├── status
└── createdAt

documents (1 index)
├── _id (primary)
└── businessId

businessVisibilities (1 index)
├── _id (primary)
└── investorId + businessId (unique composite)

investments (2 indexes)
├── _id (primary)
├── investorId
└── businessId
\`\`\`

### Relationships

\`\`\`
User (1) ───owns──→ (many) Business
User (1) ───invests→ (many) Investment
Business (1) ───has──→ (many) Document
Business (1) ───visible→ (many) User (investor)
Investment (many) ───links──→ User + Business
\`\`\`

## API Architecture

### Request/Response Pattern

\`\`\`
Request
  ↓
Route Handler
  ↓
Auth Middleware (verify JWT)
  ↓
Authorization Check (verify role)
  ↓
Input Validation
  ↓
Business Logic
  ↓
Database Query
  ↓
Response Formatting
  ↓
JSON Response with status
\`\`\`

### Error Handling

\`\`\`
Try
  ├─ Validation Error → 400 Bad Request
  ├─ Auth Error → 401 Unauthorized
  ├─ Permission Error → 403 Forbidden
  ├─ Not Found Error → 404 Not Found
  └─ Server Error → 500 Internal Server Error
Catch
  └─ Log Error + Return Response
\`\`\`

## Authentication & Authorization

### NextAuth.js Configuration

- **Provider**: Credentials (email/password)
- **Strategy**: JWT with callbacks
- **Session**: Stored in HTTP-only cookies
- **Token**: Contains user ID and role

### Role-Based Access Control (RBAC)

\`\`\`
Admin
├─ Create/manage users
├─ Approve/reject businesses
├─ Control visibility
└─ View all data

Business Owner
├─ Create businesses
├─ Manage own businesses
├─ Upload documents
└─ View own investments

Investor
├─ View assigned businesses
├─ Create investments
└─ View own investments
\`\`\`

### Middleware Protection

\`\`\`typescript
middleware.ts
├─ Verify JWT token
├─ Check route role requirements
├─ Redirect if unauthorized
└─ Allow if authorized
\`\`\`

## Performance Considerations

### Database Optimizations

- **Indexes**: Created on frequently queried fields
- **Lean Queries**: Use `.lean()` for read-only operations
- **Pagination**: Implement for large datasets
- **Connection Pooling**: Mongoose handles by default

### API Optimizations

- **Response Caching**: Static data cached
- **Query Optimization**: Only return needed fields
- **Error Handling**: Fast error responses
- **Rate Limiting**: Can be added via middleware

### Frontend Optimizations

- **Code Splitting**: Next.js automatic
- **Image Optimization**: Use next/image
- **CSS**: Tailwind CSS optimized
- **Lazy Loading**: Implemented where needed

## Security Architecture

### Password Security

\`\`\`
User enters password
    ↓
Hash with bcryptjs (10 salt rounds)
    ↓
Store hash in database
    ↓
Never store plain password
\`\`\`

### Session Security

- JWT stored in HTTP-only cookies
- Cannot access via JavaScript
- Automatically sent with requests
- Expires after 30 days (configurable)

### Data Validation

- Input sanitization on all fields
- Type checking with TypeScript
- Server-side validation on all routes
- Prevent injection attacks

### Access Control

- Role verification on every protected route
- Resource ownership verification
- Visibility mapping enforced
- No direct access to other users' data

## Deployment Architecture

### Vercel Deployment

\`\`\`
GitHub Repository
    ↓
Push to main branch
    ↓
Vercel detects changes
    ↓
Build process
├─ npm install
├─ npm run build
└─ Generate .next folder
    ↓
Deploy to edge network
    ↓
Auto-scale with traffic
\`\`\`

### Environment Strategy

\`\`\`
Development (.env.local)
└─ Local MongoDB
└─ NextAuth Secret

Production (Vercel)
└─ MongoDB Atlas
└─ Secure Secret
└─ HTTPS enforced
└─ Auto-scaling enabled
\`\`\`

## Monitoring & Logging

### Application Monitoring

- Vercel Analytics for performance
- Browser console for client errors
- Server logs for API errors
- Database performance tracking

### Error Tracking

- Server-side logging on all errors
- Client-side error boundaries
- User-friendly error messages
- Debug mode in development

## Future Scalability

### Database Scaling

- Sharding if data exceeds 10GB
- Read replicas for high-load queries
- Connection pooling optimization

### API Scaling

- Vercel auto-scales functions
- Consider edge functions for low-latency
- Implement caching layer (Redis)
- Rate limiting per user

### File Storage Scaling

- Upgrade from local to cloud storage
- AWS S3 or Vercel Blob
- CDN integration for assets
- Implement versioning for documents

---

For implementation details, see [README.md](./README.md) and [API_TESTING.md](./API_TESTING.md)
