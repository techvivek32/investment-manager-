# API Testing Guide

Complete guide for testing all API endpoints.

## Authentication

### Login

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
\`\`\`

### Get Session

\`\`\`bash
curl http://localhost:3000/api/auth/session
\`\`\`

## Users (Admin Only)

### List Users

\`\`\`bash
curl http://localhost:3000/api/admin/users
\`\`\`

### Create User

\`\`\`bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "investor"
  }'
\`\`\`

## Businesses

### List Businesses (Owner)

\`\`\`bash
curl http://localhost:3000/api/businesses
\`\`\`

### Create Business (Owner)

\`\`\`bash
curl -X POST http://localhost:3000/api/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Startup",
    "description": "A cutting-edge technology company",
    "category": "Technology",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "minInvestmentAmount": 10000,
    "maxInvestmentAmount": 100000,
    "expectedReturnPercentage": 15
  }'
\`\`\`

### Get Business

\`\`\`bash
curl http://localhost:3000/api/businesses/{businessId}
\`\`\`

### Update Business (Owner)

\`\`\`bash
curl -X PATCH http://localhost:3000/api/businesses/{businessId} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description"
  }'
\`\`\`

### List Visible Businesses (Investor)

\`\`\`bash
curl http://localhost:3000/api/investor/businesses
\`\`\`

## Admin Business Management

### Approve Business

\`\`\`bash
curl -X PATCH http://localhost:3000/api/admin/businesses/{businessId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved"
  }'
\`\`\`

### Reject Business

\`\`\`bash
curl -X PATCH http://localhost:3000/api/admin/businesses/{businessId}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "rejected"
  }'
\`\`\`

## Business Visibility

### List Visibility Assignments

\`\`\`bash
curl http://localhost:3000/api/admin/visibility
\`\`\`

### Assign Business to Investor

\`\`\`bash
curl -X POST http://localhost:3000/api/admin/visibility \
  -H "Content-Type: application/json" \
  -d '{
    "investorId": "{investorId}",
    "businessId": "{businessId}"
  }'
\`\`\`

## Documents

### List Documents

\`\`\`bash
curl http://localhost:3000/api/businesses/{businessId}/documents
\`\`\`

### Upload Document (Owner)

\`\`\`bash
curl -X POST http://localhost:3000/api/businesses/{businessId}/documents \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "business-license.pdf",
    "fileUrl": "/uploads/business-license.pdf",
    "documentType": "license"
  }'
\`\`\`

## Investments

### Create Investment (Investor)

\`\`\`bash
curl -X POST http://localhost:3000/api/investments \
  -H "Content-Type: application/json" \
  -d '{
    "businessId": "{businessId}",
    "amount": 25000
  }'
\`\`\`

### List Own Investments

\`\`\`bash
curl http://localhost:3000/api/investments
\`\`\`

### List All Investments (Admin)

\`\`\`bash
curl http://localhost:3000/api/admin/investments
\`\`\`

## Error Handling

### Expected Error Responses

**401 Unauthorized**
\`\`\`json
{
  "success": false,
  "error": "Unauthorized"
}
\`\`\`

**403 Forbidden**
\`\`\`json
{
  "success": false,
  "error": "Forbidden"
}
\`\`\`

**404 Not Found**
\`\`\`json
{
  "success": false,
  "error": "Not found"
}
\`\`\`

**400 Bad Request**
\`\`\`json
{
  "success": false,
  "error": "Invalid input: min amount must be less than max"
}
\`\`\`

## Testing Workflow

1. **Create Admin User**
   \`\`\`bash
   # Already exists with demo credentials
   \`\`\`

2. **Create Business Owner**
   \`\`\`bash
   curl -X POST http://localhost:3000/api/admin/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Owner","email":"owner@test.com","password":"pass123","role":"business_owner"}'
   \`\`\`

3. **Create Investor**
   \`\`\`bash
   curl -X POST http://localhost:3000/api/admin/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Investor","email":"investor@test.com","password":"pass123","role":"investor"}'
   \`\`\`

4. **Create Business** (as owner)
   \`\`\`bash
   curl -X POST http://localhost:3000/api/businesses \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Business","description":"Test","latitude":40.7128,"longitude":-74.0060,"minInvestmentAmount":5000,"maxInvestmentAmount":50000}'
   \`\`\`

5. **Approve Business** (as admin)
   \`\`\`bash
   curl -X PATCH http://localhost:3000/api/admin/businesses/{businessId}/status \
     -H "Content-Type: application/json" \
     -d '{"status":"approved"}'
   \`\`\`

6. **Assign to Investor** (as admin)
   \`\`\`bash
   curl -X POST http://localhost:3000/api/admin/visibility \
     -H "Content-Type: application/json" \
     -d '{"investorId":"{investorId}","businessId":"{businessId}"}'
   \`\`\`

7. **Create Investment** (as investor)
   \`\`\`bash
   curl -X POST http://localhost:3000/api/investments \
     -H "Content-Type: application/json" \
     -d '{"businessId":"{businessId}","amount":25000}'
   \`\`\`

## Using Postman

1. Import collection endpoints
2. Set variable: `{{ base_url }}` = http://localhost:3000
3. Use pre-request scripts for auth
4. Export results

---

For more details, see [README.md](./README.md)
