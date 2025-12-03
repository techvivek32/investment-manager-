You are an expert full‑stack architect and senior engineer.

I want you to DESIGN and then GENERATE a complete web application based on the following requirements using this tech stack:

- **Frontend + Backend**: Next.js (latest, App Router) with TypeScript
- **Database**: MongoDB (using Mongoose or an equivalent ODM)
- **Auth**: NextAuth.js (or a similar auth solution) with JWT/session based auth
- **Styling/UI**: Tailwind CSS (recommended) or another modern UI library
- **Deployment‑ready structure**

Read everything carefully and then:

1. Confirm and refine the tech stack for **Next.js + MongoDB**.
2. Design the MongoDB schema (collections & documents) based on the requirements below.
3. Design the API routes (using Next.js API routes or Route Handlers in the App Router).
4. Generate the actual project structure (folders, main files, example implementations).
5. Provide example code for:
   - Auth (login, role handling)
   - Role-based middleware / route protection
   - A few core routes (e.g., create business, list businesses for investor, approve business).

------------------------------------------------
HIGH‑LEVEL IDEA
------------------------------------------------
Build an **Investment & Business Listing Platform** with **role‑based access control (RBAC)**.

There are 3 main roles:
1. **Client (Admin / Super Admin)**
2. **Business Owner**
3. **Investor**

The platform allows:
- Business Owners to list their businesses with documents and map locations.
- Admin to approve those businesses and control who can see what.
- Investors to view only allowed businesses and invest in them.

The system must be clean, scalable, and secure.

------------------------------------------------
ROLES & PERMISSIONS
------------------------------------------------

### 1. Client (Admin / Super Admin)
- Can create, edit, and deactivate any user.
- Can assign roles: `admin`, `business_owner`, `investor`.
- Can see ALL businesses.
- Can approve or reject newly submitted businesses.
- Can control visibility: decide which **Investor** can see which **Business**.
- Full access to all data, logs, and configurations.

### 2. Business Owner
- Can create and manage ONLY their own businesses.
- Can:
  - Add a new business.
  - Add/edit business details (name, description, category, etc.).
  - Pin location on map (store coordinates).
  - Upload documents (licenses, PDFs, images, proofs).
- Cannot see or manage other owners’ businesses.
- Cannot see Admin‑only information.

### 3. Investor
- Can only VIEW businesses that are explicitly assigned to them by Admin.
- Can:
  - View assigned business details.
  - View documents list.
  - See map location.
  - See investment details/terms.
  - Create an "Investment" entry (e.g., choose amount and confirm).
- Cannot:
  - Create/edit businesses.
  - Upload documents.
  - See businesses they are not assigned to.

------------------------------------------------
CORE FEATURES
------------------------------------------------

1. **Authentication & Authorization**
   - Secure login.
   - Role-based access control (RBAC).
   - Protect routes based on roles:
     - Admin routes.
     - Business Owner routes.
     - Investor routes.
   - Use NextAuth.js (or similar) with credentials provider, JWT, and session handling for roles.

2. **Business Management**
   - Business Owner can:
     - Create business.
     - Edit business.
     - Upload documents.
     - Set/update location (lat/lng).
   - Each business has:
     - Name
     - Description
     - Owner (linked to user)
     - Status: `pending`, `approved`, `rejected`.
     - Location (coordinates for map).
     - List of documents.
     - Investment-related fields (e.g., min amount, max amount, expected return, etc. – you can suggest good fields).

3. **Admin Review & Approval**
   - Admin dashboard to:
     - See list of all businesses.
     - Filter by status.
     - Open business detail and documents.
     - Approve or reject businesses.
   - When approved, Admin can assign that business to specific investors.

4. **Business Visibility Control**
   - A mapping (in MongoDB) for which investor can see which business.
   - Admin can:
     - Assign multiple businesses to one investor.
     - Assign one business to multiple investors.
   - Investor can only see business listings where there is a visibility record for them.

5. **Investments Module**
   - Investor can:
     - Open an allowed business.
     - Click "Invest".
     - Enter amount and confirm.
   - System stores investments for each investor-business pair.
   - Admin can see all investments.
   - Business Owner can see investments related to their own businesses.

6. **Documents Handling**
   - Each business can have multiple documents.
   - Store metadata in MongoDB and the file path/URL (assume some storage like local, S3, or similar).
   - Include basic document types like: registration, license, financials, images, etc.

7. **Map Integration (Simplified)**
   - Store latitude and longitude in the database.
   - Frontend should show a map pin (you can use a standard library like Leaflet or a common map component).
   - For MVP, hard‑code map provider or use a lightweight open‑source solution.

------------------------------------------------
MONGODB DESIGN (COLLECTIONS)
------------------------------------------------
Design a clean MongoDB schema using Mongoose models (or similar). Suggested structure (feel free to refine):

**users** collection
- _id (ObjectId)
- name
- email (unique)
- passwordHash
- role (enum: 'admin', 'business_owner', 'investor')
- isActive (boolean)
- createdAt
- updatedAt

**businesses** collection
- _id (ObjectId)
- ownerId (ObjectId → users._id with role = 'business_owner')
- name
- description
- category (optional string or enum)
- latitude (number)
- longitude (number)
- status (enum: 'pending', 'approved', 'rejected')
- minInvestmentAmount (number/decimal)
- maxInvestmentAmount (number/decimal)
- expectedReturnPercentage (optional number)
- createdAt
- updatedAt

**documents** collection
- _id (ObjectId)
- businessId (ObjectId → businesses._id)
- fileName
- fileUrl
- documentType (string or enum)
- uploadedAt

**businessVisibility** collection
- _id (ObjectId)
- investorId (ObjectId → users._id with role = 'investor')
- businessId (ObjectId → businesses._id)
- createdAt

**investments** collection
- _id (ObjectId)
- investorId (ObjectId → users._id)
- businessId (ObjectId → businesses._id)
- amount (number/decimal)
- status (enum: 'pending', 'confirmed', 'cancelled' – you can refine)
- createdAt

You can add indexes where needed (e.g., on `role`, `ownerId`, `investorId`, `businessId`, etc.).

------------------------------------------------
API DESIGN (NEXT.JS ROUTES)
------------------------------------------------

Use **Next.js App Router** with **Route Handlers** (e.g., in `app/api/.../route.ts`) or the Pages Router API routes if you prefer. Design endpoints approximately like:

### Auth
- POST /api/auth/login
- POST /api/auth/logout
- Integrate with NextAuth.js where appropriate.

### Users (Admin only)
- GET /api/admin/users
- POST /api/admin/users  (create user with role)
- PATCH /api/admin/users/[id]
- DELETE /api/admin/users/[id]

### Businesses
- [Business Owner]
  - POST /api/businesses               (create)
  - GET /api/businesses/mine           (list own businesses)
  - GET /api/businesses/[id]           (only if owner or allowed)
  - PATCH /api/businesses/[id]         (only owner, and maybe only if pending or rejected)

- [Admin]
  - GET /api/admin/businesses          (list/filter all)
  - PATCH /api/admin/businesses/[id]/status   (approve/reject)

- [Investor]
  - GET /api/investor/businesses       (only visible ones)
  - GET /api/investor/businesses/[id]  (only visible)

### Documents
- POST /api/businesses/[id]/documents  (owner only; handle file upload or at least metadata)
- GET /api/businesses/[id]/documents   (owner, admin, or allowed investor)
- DELETE /api/documents/[id]          (optional)

### Business Visibility (Admin only)
- POST /api/admin/visibility          (assign investor to business)
- GET /api/admin/visibility           (list mappings)
- DELETE /api/admin/visibility/[id]

### Investments
- [Investor]
  - POST /api/investments             (with businessId, amount)
  - GET /api/investments/mine

- [Admin]
  - GET /api/admin/investments

- [Business Owner]
  - GET /api/owner/investments        (all investments for their businesses)

Each route must:
- Validate inputs.
- Check authentication.
- Enforce authorization (role + ownership/visibility).

------------------------------------------------
FRONTEND PAGES (NEXT.JS)
------------------------------------------------

Use the Next.js App Router and create a clean, modern UI (Tailwind CSS or similar).

**Common**
- `/login` – Login page
- `/dashboard` – Redirects to different dashboards based on role

**Admin**
- `/admin/dashboard` – overview stats (users, businesses, investments)
- `/admin/users` – list/create/edit users
- `/admin/businesses` – list all businesses with filters
- `/admin/businesses/[id]` – business detail with approve/reject and documents
- `/admin/visibility` – manage investor → business mappings
- `/admin/investments` – list all investments

**Business Owner**
- `/owner/dashboard`
- `/owner/businesses` – list of owner’s businesses
- `/owner/businesses/new`
- `/owner/businesses/[id]/edit`
- `/owner/businesses/[id]/documents`
- `/owner/investments` – investments for their businesses

**Investor**
- `/investor/dashboard`
- `/investor/businesses` – visible businesses
- `/investor/businesses/[id]` – business detail, documents, map, investment details
- `/investor/investments` – list of their own investments

------------------------------------------------
NON‑FUNCTIONAL REQUIREMENTS
------------------------------------------------
- Clean, modular code structure for Next.js + MongoDB.
- Environment‑based configuration (env variables for DB URI, JWT secret, etc.).
- Secure password handling (hashing via bcrypt or similar).
- Proper error handling and standardized JSON API responses.
- Basic input validation and sanitization.
- Reusable auth + RBAC middleware for:
  - Checking if user is logged in.
  - Checking the user’s role.
  - Checking resource ownership or visibility.

------------------------------------------------
WHAT I WANT YOU (CURSOR / AI) TO DO NOW
------------------------------------------------

1. Use **Next.js (TypeScript, App Router) + MongoDB** as the main stack, with NextAuth (or similar) for auth.
2. Generate:
   - Project structure (folders & core files for both frontend and backend inside the Next.js app).
   - Mongoose models for all collections (User, Business, Document, BusinessVisibility, Investment).
   - Example implementations for:
     - Auth (login logic, role storage, NextAuth config).
     - Role-based middleware (server-side, API route protection).
     - A few core API routes:
       - Create business (owner).
       - List businesses for investor (only visible).
       - Approve business (admin).
3. Provide clear instructions on:
   - How to set up `.env` (MongoDB URI, secrets).
   - How to run the Next.js project.
   - How to connect to MongoDB.
4. Keep the code clean, typed (TypeScript), and production‑ready for extension.

Start by summarizing the final architecture you propose (Next.js + MongoDB), then start generating code step by step.
------------------------------------------------
FINAL ARCHITECTURE SUMMARY
------------------------------------------------

- Full‑stack Next.js 16 (App Router) with TypeScript
- Authentication: NextAuth.js (JWT sessions, credentials provider)
- Database: MongoDB via Mongoose, connection pooling and indexes
- RBAC: admin, business_owner, investor enforced in API handlers and middleware
- UI: Tailwind CSS v4 with reusable UI components
- Deployment: Vercel‑ready configuration and middleware

------------------------------------------------
IMPLEMENTED PROJECT STRUCTURE
------------------------------------------------

- Root layout and pages: `app/layout.tsx:1`, `app/login/page.tsx:1`, `app/dashboard/page.tsx:1`
- Role dashboards and pages:
  - Admin: `app/admin/dashboard/page.tsx:1`, `app/admin/users/page.tsx:1`, `app/admin/businesses/page.tsx:1`, `app/admin/businesses/[id]/page.tsx:1`, `app/admin/visibility/page.tsx:1`, `app/admin/investments/page.tsx:1`
  - Owner: `app/owner/dashboard/page.tsx:1`, `app/owner/businesses/new/page.tsx:1`, `app/owner/businesses/[id]/edit/page.tsx:1`
  - Investor: `app/investor/dashboard/page.tsx:1`, `app/investor/businesses/page.tsx:1`, `app/investor/businesses/[id]/page.tsx:1`
- Auth config: `app/api/auth/[...nextauth]/route.ts:1`
- Middleware helpers: `lib/middleware/auth.ts:1`
- DB connection: `lib/db/mongoose.ts:1`
- Auth utilities: `lib/db/auth.ts:1`
- Types: `lib/types/index.ts:1`
- Utility responses: `lib/utils/response.ts:1`
- Models:
  - User: `lib/models/User.ts:1`
  - Business: `lib/models/Business.ts:1`
  - Document: `lib/models/Document.ts:1`
  - BusinessVisibility: `lib/models/BusinessVisibility.ts:1`
  - Investment: `lib/models/Investment.ts:1`

------------------------------------------------
KEY ENDPOINTS IMPLEMENTED
------------------------------------------------

- Auth:
  - `POST /api/auth/login` via NextAuth credentials in `app/api/auth/[...nextauth]/route.ts:6`
  - `POST /api/auth/logout`, `GET /api/auth/session` available in `app/api/auth/*`
- Businesses:
  - Create (owner): `app/api/businesses/route.ts:35`
  - List (owner/admin): `app/api/businesses/route.ts:7`
  - Approve/Reject (admin): `app/api/admin/businesses/[id]/status/route.ts:7`
- Investor visibility list: `app/api/investor/businesses/route.ts:7`
- Investments:
  - Create (investor): `app/api/investments/route.ts:46`
  - List (investor/owner): `app/api/investments/route.ts:9`

Each handler uses `getSessionUser` for auth, validates inputs, and returns standardized JSON.

------------------------------------------------
MONGOOSE SCHEMA OVERVIEW
------------------------------------------------

- User: email, passwordHash, role, isActive with indexes (`lib/models/User.ts:6`)
- Business: ownerId, status, location, investment terms (`lib/models/Business.ts:6`)
- Document: file metadata and type (`lib/models/Document.ts:6`)
- BusinessVisibility: composite index investorId+businessId (`lib/models/BusinessVisibility.ts:6`)
- Investment: amount, status with indexes (`lib/models/Investment.ts:6`)

------------------------------------------------
ENVIRONMENT SETUP
------------------------------------------------

Create `.env.local` in the project root:

```
MONGODB_URI=mongodb://127.0.0.1:27017/investment_platform
NEXTAUTH_SECRET=<replace-with-32+ char secret>
NEXTAUTH_URL=http://localhost:3000
UPLOAD_DIR=./public/uploads
NEXT_PUBLIC_APP_NAME=Investment Platform
NEXT_PUBLIC_MAP_PROVIDER=leaflet
```

Ensure a MongoDB instance is running locally or use Atlas. Update `MONGODB_URI` accordingly.

------------------------------------------------
RUNNING LOCALLY
------------------------------------------------

1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`
3. Open: `http://localhost:3000`

Admin can create users via `POST /api/admin/users` once logged in. Use role dashboards under `/admin`, `/owner`, `/investor`.

------------------------------------------------
NOTES & EXTENSIONS
------------------------------------------------

- Input validation via `lib/db/validators.ts:1` and zod forms are ready for extension.
- File uploads currently store metadata; integrate S3 or Cloudinary for production.
- Add rate limiting and audit logs for admin actions in future iterations.
