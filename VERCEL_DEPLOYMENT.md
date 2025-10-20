# Vercel Deployment Guide for SeekEngine

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Prepare Your Repository

Before deploying, ensure your git repository is clean and ready:

```bash
# Check git status
git status

# You should see:
# - .env.local (not tracked - good!)
# - All source files tracked

# If .env.local is tracked, remove it:
git rm --cached .env.local
git commit -m "Remove environment file from tracking"
```

**Verify .gitignore includes .env.local:**
```bash
grep -i "env.local" .gitignore
# Should output: .env.local
```

---

### Step 2: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub (or create account)
3. Click "Import Project"
4. Select your SeekEngine repository
5. Click "Import"

---

### Step 3: Configure Environment Variables in Vercel

This is **CRITICAL** - your API keys go here, not in code:

1. In the Vercel dashboard, go to your project settings
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

#### Variable 1: Google API Key
- **Name**: `NEXT_PUBLIC_GOOGLE_API_KEY`
- **Value**: Your actual Google Custom Search API key
- **Environments**: Select "Production", "Preview", and "Development"

#### Variable 2: Custom Search Engine ID
- **Name**: `NEXT_PUBLIC_GOOGLE_CX`
- **Value**: Your actual Custom Search Engine ID
- **Environments**: Select "Production", "Preview", and "Development"

**⚠️ IMPORTANT**:
- Use `NEXT_PUBLIC_` prefix (required for browser access)
- Add to ALL environments (Production, Preview, Development)
- Never paste keys in chat or email
- Store keys securely

---

### Step 4: Deploy

After setting environment variables:

1. Go back to project overview
2. Click "Deploy"
3. Vercel will automatically:
   - Clone your repository
   - Install dependencies
   - Build your project
   - Deploy to production

**Expected output:**
```
✓ Built successfully
✓ Environment variables validated successfully
✓ Deployed to production
```

---

## ✅ Verification Checklist

### Before Deployment:
- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.local` is NOT committed to git
- [ ] No API keys in source code
- [ ] All files committed to git
- [ ] Build passes locally: `npm run build`

### During Deployment:
- [ ] Environment variables set in Vercel
- [ ] Build succeeds in Vercel
- [ ] No build errors or warnings

### After Deployment:
- [ ] Visit deployed URL
- [ ] Test search functionality
- [ ] Check browser console for errors
- [ ] Monitor error logs

---

## 🔒 Security Best Practices for Vercel

### 1. Environment Variable Protection
```
✅ DO:
- Use NEXT_PUBLIC_ prefix for client-accessible vars
- Keep secrets in Vercel dashboard
- Never commit .env files
- Rotate keys regularly

❌ DON'T:
- Hardcode API keys in code
- Share .env files
- Log sensitive variables
- Use old/exposed keys
```

### 2. Rate Limiting on Vercel
The rate limiter works on Vercel because:
- Express middleware runs in serverless functions
- IP addresses are properly forwarded via X-Forwarded-For
- Each deployment gets fresh rate limit counters

**Note**: If you scale to multiple regions, consider Redis for distributed rate limiting (optional, not needed initially)

### 3. Monitoring
After deployment, monitor:
- Error logs in Vercel dashboard
- Rate limiting 429 responses
- Invalid search attempts
- Environment validation logs

---

## 📊 Deployment Configuration

### vercel.json (Optional - we'll create this)

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_GOOGLE_API_KEY": "@next_public_google_api_key",
    "NEXT_PUBLIC_GOOGLE_CX": "@next_public_google_cx"
  },
  "functions": {
    "pages/api/**": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

---

## 🚨 Troubleshooting Deployment

### Issue: "Environment variables validated successfully" then 500 error

**Cause**: Missing environment variables in Vercel

**Fix**:
1. Go to Vercel project settings
2. Verify both variables are set
3. Redeploy project

### Issue: Search returns 400 error

**Cause**: Validation failing on deployment

**Fix**:
1. Check browser console for error message
2. Verify search term is valid (not too long, no special chars)
3. Check API rate limit isn't exceeded

### Issue: Rate limiter showing "Too many requests" immediately

**Cause**: Rate limiter is working! Or IP detection issue

**Fix**:
- Wait 15 minutes for rate limit window to reset
- Different IP addresses have separate limits
- Check Vercel logs for rate limit hits

### Issue: Build fails with "NEXT_PUBLIC_GOOGLE_API_KEY is not defined"

**Cause**: Environment variables not set in Vercel

**Fix**:
1. Go to Vercel Settings → Environment Variables
2. Add both required variables
3. Click "Save"
4. Trigger new deployment (redeploy)

---

## 📈 Post-Deployment Monitoring

### Check Logs in Vercel

1. Go to project in Vercel dashboard
2. Click "Deployments"
3. Select latest deployment
4. View logs (Stdout/Stderr)

**Look for**:
```
✅ Environment variables validated successfully
✅ Compiled successfully
✓ Collecting page data
```

### Performance Metrics

Monitor in Vercel Analytics:
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Cumulative Layout Shift (CLS)
- Web Vitals

**Targets**:
- TTFB: < 500ms
- FCP: < 2.5s
- CLS: < 0.1

### Error Tracking

1. Check "Monitoring" tab in Vercel
2. Review error logs
3. Set up alerts (optional)

---

## 🔄 Redeployment Process

If you make code changes and want to redeploy:

```bash
# 1. Make your changes
# 2. Test locally
npm run build
npm run start

# 3. Commit to git
git add .
git commit -m "Feature: Add XYZ improvement"
git push origin main

# 4. Vercel automatically deploys!
# No manual action needed
```

**Vercel automatically:**
- Pulls latest code
- Installs dependencies
- Builds project
- Deploys to production

---

## 🌍 Custom Domain (Optional)

To use a custom domain:

1. Go to project settings
2. Click "Domains"
3. Enter your domain
4. Follow DNS setup instructions
5. Wait for DNS propagation (5-48 hours)

---

## 🔐 Rotating API Keys

If you need to rotate your Google API keys (recommended):

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new API key
3. Delete old key
4. Update in Vercel:
   - Settings → Environment Variables
   - Update NEXT_PUBLIC_GOOGLE_API_KEY
   - Trigger redeploy

---

## 📋 Vercel Deployment Checklist

```
Pre-Deployment:
- [ ] Local build passes: npm run build
- [ ] .env.local in .gitignore
- [ ] No API keys in source code
- [ ] All changes committed to git

Vercel Setup:
- [ ] Project imported to Vercel
- [ ] NEXT_PUBLIC_GOOGLE_API_KEY set
- [ ] NEXT_PUBLIC_GOOGLE_CX set
- [ ] Variables in all environments

Post-Deployment:
- [ ] Build succeeded in Vercel
- [ ] Website loads without errors
- [ ] Search works correctly
- [ ] Console shows no errors
- [ ] Rate limiting works (test with rapid clicks)

Ongoing:
- [ ] Monitor error logs weekly
- [ ] Check Web Vitals
- [ ] Review rate limit metrics
- [ ] Update dependencies monthly
```

---

## 💡 Pro Tips

### 1. Preview Deployments
- Every PR gets a preview deployment
- Test changes before merging to main
- Share preview URL with team

### 2. Automatic Rollback
- If deployment fails, Vercel keeps previous version live
- No downtime during failed deployments

### 3. Environment-Specific Config
- Production, Preview, and Development can have different settings
- Useful for A/B testing new features

### 4. Analytics
- Vercel provides built-in Web Analytics
- Track visitor patterns
- Identify performance bottlenecks

---

## 🆘 Emergency Procedures

### If API Keys are Compromised:

1. **Immediately**:
   - Revoke old keys in Google Cloud Console
   - Create new API key
   - Update in Vercel

2. **Update Vercel**:
   - Go to Environment Variables
   - Update NEXT_PUBLIC_GOOGLE_API_KEY
   - Save and trigger redeploy

3. **Monitor**:
   - Watch API quota usage
   - Check for unusual activity
   - Review rate limit logs

---

## 📞 Support & Resources

### Vercel Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Deployment Guide](https://vercel.com/docs/concepts/deployments/overview)

### Google Custom Search
- [API Docs](https://developers.google.com/custom-search/v1/overview)
- [Quotas & Pricing](https://developers.google.com/custom-search/pricing)

### Getting Help
- Vercel Support: support@vercel.com
- GitHub Issues: github.com/archduke1337/SeekEngine/issues
- Stack Overflow: Tag with `vercel`, `nextjs`

---

## 🎯 Next Steps After Deployment

1. **Monitor** (Week 1):
   - Check error logs daily
   - Verify rate limiting works
   - Monitor API quota usage

2. **Optimize** (Week 2):
   - Add analytics
   - Optimize Web Vitals
   - Set up error tracking

3. **Scale** (Week 3+):
   - Add custom domain
   - Implement caching strategies
   - Consider Redis for distributed rate limiting

---

**Status**: Ready for Vercel Deployment ✅
**Last Updated**: October 20, 2025
**Next**: Follow the step-by-step guide above!
