✅ Purpose of This Project (What It Is Used For)
This project is an Investment & Business Listing Platform where businesses can be listed and investors can invest in them — but with strict access control.

Different types of users (Admin, Business Owner, Investor) get different permissions.

Simple Purpose Summary:
“A secure platform where business owners list their businesses, admins approve and control visibility, and investors can view and invest only in the businesses assigned to them.”

This system is useful for:

Real estate investment companies

Franchise investment platforms

Startup funding management

Private investment agencies

Any multi-party financial platform

✅ Detailed Description of the Project
This project manages three roles:

1. Client / Admin
Admin controls the entire platform.

Admin can:

Create users (Business Owners, Investors)

Approve or reject business listings

Set which investor can see which business

View all documents & locations

Manage all investments

Admin is basically the super controller.

2. Business Owner
A business owner can:

Create and manage their own business listings

Add business description, category, terms, etc.

Upload documents (licenses, registration, financial proofs)

Pin the business location on a map (latitude/longitude)

View investments made in their businesses

Owners cannot see other owners’ businesses.

3. Investor
Investors can only:

View businesses assigned by the admin

Open business details (description, docs, map)

Check investment requirements

Invest in the business

View their investment history

Investors cannot edit or upload anything.

✅ Detailed Features of the System
A. Authentication & Role-Based Access (RBAC)
Secure login system

Each user has a role:
admin / business_owner / investor

Protected API routes depending on role

Only authorized users can access specific functions

This makes the system highly secure & professional.

B. Business Management (For Business Owners)
Create new business

Edit business information

Upload multiple documents

Add map location

Set investment details (minimum, maximum amount)

Business goes to Admin for approval

Business always has one of these statuses:

pending

approved

rejected

C. Document Management
Each business can have multiple documents:

Registration certificate

Business license

Images/photos

Financial documents

Legal papers

Documents stored with metadata:

file URL

type

uploaded date

Access Rules:

Admin → can view all documents

Owner → can view/upload for their business

Investor → can view only for the businesses assigned to them

D. Admin Approval Flow
Admin gets:

List of all businesses

Pending approval requests

Business details + documents

Buttons for Approve / Reject

Admin can also assign:

Which investor is allowed to see which business.

This is the most important part of the system:
fine‑grained visibility control.

E. Investor Panel & Investment Module
Investors get a restricted view:

Only allowed businesses appear

Business detail page shows:

description

documents

location map

investment requirements

They can:

Enter investment amount

Confirm investment

View their investment history

Admin can view all investments, and Business Owner can view investments in their own businesses.

F. Map & Location Feature
Every business has:

Latitude

Longitude

Frontend shows:

A map pin at the business location

This creates a realistic and professional business profile.

G. Analytics & Dashboard (Optional but powerful)
Admin dashboard can show:

Total users

Total businesses (pending/approved/rejected)

Total investments

Investor/business activity

This makes the platform feel complete and enterprise‑grade.

