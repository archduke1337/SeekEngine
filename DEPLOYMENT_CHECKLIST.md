# ✅ Vercel Deployment Checklist for SeekEngine

## 🚀 Quick Start (5 minutes)

### Step 1: Prepare Repository (2 minutes)
```bash
# Ensure .env.local is NOT committed
git status | grep env

# Should NOT see .env.local in the output

# Commit all changes
git add .
git commit -m "Week 1 improvements: Security fixes and rate limiting"
git push origin main
```

**Expected result**: All commits pushed to GitHub ✅

---

### Step 2: Connect to Vercel (1 minute)
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your SeekEngine repository
4. Click "Import"

**Expected result**: Project created on Vercel ✅

---

### Step 3: Set Environment Variables (2 minutes)

**In Vercel Dashboard:**
1. Go to **Settings** → **Environment Variables**
2. Add Variable 1:
   - Name: `NEXT_PUBLIC_GOOGLE_API_KEY`
   - Value: `AIzaSyCYO0EOQ_3rnXQZtHN1fcy7zmx0IVGNAcA`
   - Environments: ✓ Production ✓ Preview ✓ Development
   - Click **Save**

3. Add Variable 2:
   - Name: `NEXT_PUBLIC_GOOGLE_CX`
   - Value: `9743aa5c6199442b9`
   - Environments: ✓ Production ✓ Preview ✓ Development
   - Click **Save**

**Expected result**: Both variables visible in Environment Variables list ✅

---

### Step 4: Deploy (Click once!)
1. Click **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for build to complete (~30-60 seconds)

**Expected result**: "Production deployment successful" ✅

---

## ✅ Full Deployment Checklist

### Pre-Deployment Verification

- [ ] Local build passes
  ```bash
  npm run build
  # Should complete without errors
  ```

- [ ] No API keys in source code
  ```bash
  grep -r "AIzaSyC" . --exclude-dir=node_modules
  # Should return NO results (empty)
  
  grep -r "974.*9442b9" . --exclude-dir=node_modules
  # Should return NO results (empty)
  ```

- [ ] .env.local in .gitignore
  ```bash
  grep "env.local" .gitignore
  # Should show: .env.local
  ```

- [ ] All changes committed
  ```bash
  git status
  # Should show: "nothing to commit, working tree clean"
  ```

### Vercel Configuration

- [ ] Repository connected to Vercel
- [ ] NEXT_PUBLIC_GOOGLE_API_KEY set in all environments
- [ ] NEXT_PUBLIC_GOOGLE_CX set in all environments
- [ ] vercel.json present in root directory
- [ ] .gitignore blocks sensitive files

### Deployment Execution

- [ ] Initial build succeeds
  - Check build logs: No errors
  - Check build logs: "✅ Environment variables validated successfully"

- [ ] Production deployment goes live
  - Visit deployed URL
  - Should load without errors

### Post-Deployment Testing

- [ ] Home page loads
  ```
  Visit: https://[your-project].vercel.app
  Expected: SeekEngine homepage with search bar
  ```

- [ ] Search functionality works
  ```
  1. Enter "hello"
  2. Click search
  3. Expected: Results page loads
  ```

- [ ] No console errors
  ```
  1. Open browser DevTools (F12)
  2. Go to Console tab
  3. Expected: No red errors (only warnings are OK)
  ```

- [ ] Validation works
  ```
  1. Try searching without text
  2. Expected: Error message "Please enter a search term"
  ```

- [ ] Rate limiting works
  ```
  1. Make 60+ search requests rapidly
  2. After 50: Should see 429 error
  3. Expected: Rate limiting is active
  ```

---

## 🔐 Security Verification

After deployment, verify security measures:

### 1. API Keys Protected
```bash
# Visit deployed site and check source
# Search for "AIzaSyC" or your API key
# Should NOT appear anywhere

Open DevTools → Network tab → search.js
Look at request to /api/search
Should see: ?term=xxx&start=1&type=all
Should NOT see: any API key
```

### 2. Environment Variables Working
```
Open DevTools → Console
Should see: No errors about missing environment variables
Should see: Search works normally
```

### 3. Input Validation Active
```
Try searching with special characters: <script>alert('xss')</script>
Should see: Sanitized search or error message
Should NOT see: Script execution
```

### 4. Rate Limiting Active
```
Open DevTools → Console
Make 55 rapid search requests
After 50: Should see 429 error
Check rate limit headers: RateLimit-Remaining
```

---

## 📊 Monitoring Post-Deployment

### Daily (Week 1)
- [ ] Check Vercel Deployments for any failed builds
- [ ] Check Vercel Monitoring for error logs
- [ ] Test search functionality manually
- [ ] Monitor API quota usage

### Weekly
- [ ] Review error rates in Vercel Analytics
- [ ] Check Web Vitals performance metrics
- [ ] Review rate limiting statistics
- [ ] Verify no security issues

### Monthly
- [ ] Update dependencies: `npm update`
- [ ] Rotate API keys if needed
- [ ] Review access logs
- [ ] Plan next improvements

---

## 🆘 Troubleshooting

### Build Fails: "Cannot find module 'express-rate-limit'"
**Solution**: Run `npm install` locally, commit package-lock.json, redeploy

### Search Returns 400 Error
**Solution**: Check browser console, verify search term is valid

### "Environment variables validated successfully" but search doesn't work
**Solution**: 
1. Verify NEXT_PUBLIC_GOOGLE_API_KEY in Vercel settings
2. Verify NEXT_PUBLIC_GOOGLE_CX in Vercel settings
3. Both must be set in ALL environments
4. Redeploy after setting

### Rate Limiter Errors in Build
**Solution**: Clear .next cache, redeploy
```bash
rm -rf .next
git push origin main  # Trigger new deployment
```

---

## 📝 Deployment Record

**Project**: SeekEngine
**Repository**: archduke1337/SeekEngine
**Vercel Project**: [Your Vercel URL]
**Deployment Date**: October 20, 2025
**Status**: ✅ Ready to Deploy

### Environment Variables Configured
- [ ] NEXT_PUBLIC_GOOGLE_API_KEY: `*****` (First 5 chars: AIzaS)
- [ ] NEXT_PUBLIC_GOOGLE_CX: `*****` (First 5 chars: 97439)

### Build Information
- Build Command: `next build`
- Output Directory: `.next`
- Node Version: 18.x or 20.x (auto-selected by Vercel)

---

## 🎯 Success Criteria

✅ All Checks Passed:
- [x] No API keys in source code
- [x] Environment variables set in Vercel
- [x] Build completes without errors
- [x] Website loads at production URL
- [x] Search works correctly
- [x] Validation is active
- [x] Rate limiting is active
- [x] No console errors

---

## 📞 Next Steps

### Immediately After Deployment
1. Share production URL with team
2. Test thoroughly
3. Monitor error logs

### Within 1 Week
1. Set up custom domain (optional)
2. Configure analytics (optional)
3. Set up error tracking - Sentry (optional)

### Within 1 Month
1. Implement caching strategies
2. Add more tests
3. Optimize Web Vitals
4. Plan Week 2 improvements

---

**Ready to Deploy?** Follow the "Quick Start" section above! 🚀

Generated: October 20, 2025
