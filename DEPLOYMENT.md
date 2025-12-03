# Deployment Guide

Complete instructions for deploying the Investment & Business Listing Platform to production.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Monitoring & Maintenance](#monitoring--maintenance)

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB Atlas cluster created and secured
- [ ] NextAuth secret generated (minimum 32 characters)
- [ ] Git repository initialized and pushed
- [ ] All tests passing locally
- [ ] Environment variables tested locally
- [ ] Database indexes verified
- [ ] HTTPS enabled (automatic with Vercel)

## Vercel Deployment

### Option 1: Deploy from GitHub

1. **Push to GitHub**
   \`\`\`bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   \`\`\`

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from `.env.local`
   - Ensure production values are set

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your production URL

### Option 2: CLI Deployment

\`\`\`bash
npm i -g vercel
vercel
# Follow prompts to link project and deploy
\`\`\`

## Environment Variables

### Required Variables

\`\`\`env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/investment_platform?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_SECRET=generate-using: openssl rand -base64 32
NEXTAUTH_URL=https://your-production-domain.com

# Optional
NEXT_PUBLIC_APP_NAME=Investment Platform
NEXT_PUBLIC_MAP_PROVIDER=leaflet
UPLOAD_DIR=./public/uploads
\`\`\`

### Generate SecureNextAuth Secret

\`\`\`bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 -InputObject (0..255))))
\`\`\`

## Database Setup

### MongoDB Atlas Setup

1. **Create Cluster**
   - Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
   - Create free account or sign in
   - Create M0 cluster (free tier)

2. **Create Database User**
   - Go to Database Access
   - Create user with username and strong password
   - Grant readWriteAnyDatabase role

3. **Get Connection String**
   - Go to Clusters
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password

4. **Whitelist IP Address**
   - Go to Network Access
   - Add IP Address
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for development
   - Restrict to specific IPs for production

5. **Create Database & Collections**
   - Mongoose will auto-create collections on first connection
   - Verify collections appear in MongoDB Atlas UI after first request

### Index Management

Indexes are automatically created by Mongoose models. To verify:

\`\`\`javascript
// In MongoDB Shell
use investment_platform

// View all indexes
db.users.getIndexes()
db.businesses.getIndexes()
db.investments.getIndexes()
db.businessvisibilities.getIndexes()
\`\`\`

## Post-Deployment Steps

### 1. Create Admin User

After deployment, create the first admin user via API:

\`\`\`bash
curl -X POST https://your-domain.com/api/admin/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@your-domain.com",
    "password": "strong-password-here",
    "role": "admin"
  }'
\`\`\`

### 2. Verify Database Connection

1. Go to your Vercel deployment URL
2. Click "Sign In"
3. Use admin credentials
4. If login works, database is connected

### 3. Set Up SSL/TLS

- Vercel provides free SSL automatically
- Ensure `NEXTAUTH_URL` uses `https://` in production

### 4. Configure Custom Domain (Optional)

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` with custom domain

## Production Optimizations

### 1. Enable Caching

\`\`\`typescript
// Example in API routes
res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
\`\`\`

### 2. Database Query Optimization

- Ensure all indexes are created
- Use Mongoose `.lean()` for read-only queries
- Implement pagination for large result sets

### 3. API Rate Limiting

Consider adding rate limiting for production:

\`\`\`typescript
// Install: npm install @upstash/ratelimit
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function middleware(request: Request) {
  const { success } = await ratelimit.limit("api-rate-limit");
  if (!success) return new Response("Rate limited", { status: 429 });
}
\`\`\`

## Monitoring & Maintenance

### Monitor Vercel Deployment

1. **Vercel Analytics**
   - Go to Analytics tab
   - Monitor API routes and page performance
   - Track errors and slowdowns

2. **Error Tracking**
   - Set up Sentry (optional)
   - Monitor unhandled errors

### Monitor MongoDB

1. **Atlas Performance**
   - Monitor cluster memory usage
   - Check query performance
   - Review database size trends

2. **Connection Issues**
   - Verify IP whitelist if connections fail
   - Check database user credentials
   - Ensure connection string is correct

### Regular Maintenance

**Weekly:**
- Review error logs
- Check database size growth
- Monitor API response times

**Monthly:**
- Review user base growth
- Check for data inconsistencies
- Update dependencies

**Quarterly:**
- Security audit
- Database optimization
- Backup verification

## Troubleshooting

### Issue: Database Connection Fails

**Solution:**
1. Verify `MONGODB_URI` is correct
2. Check database user exists and password is correct
3. Verify IP address is whitelisted
4. Test connection string locally first

### Issue: NextAuth Not Working

**Solution:**
1. Verify `NEXTAUTH_SECRET` is set and same across deployments
2. Ensure `NEXTAUTH_URL` matches deployment domain
3. Check cookies are enabled in browser
4. Verify session storage in browser

### Issue: Build Fails

**Solution:**
1. Check all required environment variables are set
2. Verify TypeScript compilation: `npm run build`
3. Check for missing dependencies
4. Review build logs in Vercel dashboard

### Issue: File Upload Not Working

**Solution:**
1. Verify `/public/uploads` directory exists
2. Check file permissions on server
3. For production, consider using cloud storage (S3, Vercel Blob)

## Upgrading to Cloud Storage

### Vercel Blob Integration

\`\`\`bash
npm install @vercel/blob
\`\`\`

\`\`\`typescript
// In API route
import { put } from '@vercel/blob';

const blob = await put(filename, file, {
  access: 'public',
});

// Store blob.url in MongoDB
\`\`\`

### AWS S3 Integration

\`\`\`bash
npm install aws-sdk
\`\`\`

\`\`\`typescript
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

await s3.putObject({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: filename,
  Body: file,
}).promise();
\`\`\`

## Scaling Considerations

### When to Upgrade

- **Database**: Upgrade from M0 if approaching 512MB limit
- **API**: Vercel scales automatically; monitor response times
- **Storage**: Implement file retention policy or cloud storage

### Performance Optimization

- Implement caching with Redis (Upstash)
- Use database connection pooling
- Optimize images and assets
- Consider CDN for static files

## Rollback Procedure

If deployment has issues:

1. **In Vercel Dashboard**
   - Go to Deployments tab
   - Find previous stable deployment
   - Click "..." → "Promote to Production"

2. **In Git**
   - Revert problematic commits
   - Push to main branch
   - Vercel auto-deploys

## Support & Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Last Updated**: December 2024
