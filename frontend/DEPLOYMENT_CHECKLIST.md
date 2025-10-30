# Netlify Deployment Checklist

## Pre-Deployment ✅

- [x] JWT authentication removed from frontend
- [x] API endpoints use environment variables
- [x] netlify.toml configuration created
- [x] _redirects file added for SPA routing
- [x] Build command includes CI=false flag
- [x] Package.json dependencies verified
- [x] Meta tags and title updated

## Backend Requirements ⚠️

- [ ] Backend deployed and accessible
- [ ] Backend URL obtained
- [ ] CORS configured for Netlify domain
- [ ] Backend authentication middleware updated/removed

## Netlify Setup 🚀

- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Build settings configured:
  - Base directory: `frontend`
  - Build command: `CI=false npm run build`
  - Publish directory: `build`
- [ ] Environment variable added:
  - `REACT_APP_API_URL` = your backend URL

## Post-Deployment Testing 🧪

- [ ] Site loads without errors
- [ ] Dashboard displays correctly
- [ ] Can create new portfolio
- [ ] Can add investments
- [ ] API calls work correctly
- [ ] Charts render properly
- [ ] Responsive design works on mobile

## Common Issues & Solutions

### Build Fails
```
Solution: Check Node version (18+) and review build logs
```

### API Calls Return 404
```
Solution: Verify REACT_APP_API_URL is set correctly in Netlify
```

### CORS Errors
```
Solution: Update backend CORS to include Netlify domain
```

### Blank Page
```
Solution: Check browser console and verify _redirects file
```

## Quick Deploy Commands

```bash
# Local test build
cd frontend
npm install
npm run build

# Deploy via Netlify CLI
netlify deploy --prod

# Or use Netlify UI
# Drag & drop the build folder
```

## Environment Variables Template

```env
# Development (.env)
REACT_APP_API_URL=http://localhost:5004

# Production (Netlify Dashboard)
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Detailed guide
- [NETLIFY_CHANGES.md](./NETLIFY_CHANGES.md) - Changes made

---

**Ready to Deploy?** Follow the steps in [DEPLOYMENT.md](./DEPLOYMENT.md)
