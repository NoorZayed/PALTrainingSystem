# 🚀 Deployment Guide for PAL Training System

This guide covers multiple deployment options for your PAL Training System to create live demos and production environments.

## 📋 Table of Contents

1. [GitHub Pages (Frontend Only)](#github-pages-frontend-only)
2. [Full Stack Deployment Options](#full-stack-deployment-options)
3. [Backend Deployment](#backend-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Demo Setup](#demo-setup)

## 1. 🌐 GitHub Pages (Frontend Only)

### Automatic Deployment

The project is already configured for automatic deployment to GitHub Pages:

1. **GitHub Actions Workflow**: `.github/workflows/deploy.yml` handles automatic deployment
2. **Package.json**: Configured with `homepage` and deployment scripts
3. **Live URL**: https://noorzayed.github.io/PALTrainingSystem

### Manual Deployment

```bash
# Build and deploy manually
npm run build
npm run deploy
```

### Enable GitHub Pages

1. Go to your GitHub repository settings
2. Navigate to **Pages** section
3. Select **GitHub Actions** as source
4. The site will be available at: `https://yourusername.github.io/PALTrainingSystem`

## 2. 🔧 Full Stack Deployment Options

### Option A: Render (Recommended)

**Frontend (Static Site)**
1. Connect your GitHub repo to [Render](https://render.com)
2. Create a new **Static Site**
3. Build command: `npm run build`
4. Publish directory: `build`

**Backend (Web Service)**
1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Root directory: `backend`
4. Build command: `npm install && npm run build`
5. Start command: `npm start`

### Option B: Vercel + Railway

**Frontend on Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Backend on Railway:**
1. Connect GitHub repo to [Railway](https://railway.app)
2. Deploy the `/backend` folder
3. Add environment variables

### Option C: Netlify + Heroku

**Frontend on Netlify:**
1. Connect GitHub repo to [Netlify](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `build`

**Backend on Heroku:**
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create pal-training-api

# Deploy backend
cd backend
git subtree push --prefix backend heroku main
```

## 3. 🗄️ Backend Deployment

### Database Options

**Option A: PlanetScale (MySQL)**
1. Create account at [PlanetScale](https://planetscale.com)
2. Create new database
3. Import your SQL schema
4. Get connection string

**Option B: Railway MySQL**
1. Add MySQL service in Railway
2. Import your database schema
3. Use provided connection credentials

**Option C: Heroku Postgres**
```bash
# Add Postgres addon
heroku addons:create heroku-postgresql:hobby-dev
```

### Environment Variables

Set these in your deployment platform:

```env
# Database
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=pal_db
DB_PORT=3306

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Server
PORT=5000
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

## 4. 🔧 Environment Configuration

### Update API Base URL

Create a production configuration in `src/config/api.ts`:

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-api.com/api'  // Your deployed backend
  : 'http://localhost:5000/api';        // Local development

export { API_BASE_URL };
```

### Update all API calls to use the configuration:

```typescript
import { API_BASE_URL } from '../config/api';

// Replace hardcoded URLs with the config
axios.get(`${API_BASE_URL}/students`)
```

## 5. 🎭 Demo Setup

### Create Demo Data

1. **Demo Database**: Create a separate database with sample data
2. **Demo Accounts**: Set up test accounts for each user role
3. **Reset Script**: Automatic daily reset of demo data

### Demo Features

```typescript
// src/config/demo.ts
export const DEMO_CONFIG = {
  API_BASE_URL: 'https://your-demo-api.com/api',
  DEMO_ACCOUNTS: {
    student: { email: 'demo.student@pal.com', password: 'demo123' },
    company: { email: 'demo.company@pal.com', password: 'demo123' },
    supervisor: { email: 'demo.supervisor@pal.com', password: 'demo123' },
    admin: { email: 'demo.admin@pal.com', password: 'demo123' }
  }
};
```

## 🚀 Quick Deployment Checklist

### Frontend Deployment
- [ ] Update `package.json` homepage URL
- [ ] Configure GitHub Actions workflow
- [ ] Set up environment variables
- [ ] Update API endpoints
- [ ] Test build process
- [ ] Deploy and verify

### Backend Deployment
- [ ] Choose hosting platform
- [ ] Set up database
- [ ] Configure environment variables
- [ ] Update CORS settings
- [ ] Deploy and test API endpoints
- [ ] Verify database connections

### Post-Deployment
- [ ] Test all user roles
- [ ] Verify API connectivity
- [ ] Check responsive design
- [ ] Set up monitoring
- [ ] Update README with live links
- [ ] Share demo credentials

## 🔗 Useful Links

- **GitHub Pages**: https://pages.github.com/
- **Render**: https://render.com/
- **Vercel**: https://vercel.com/
- **Netlify**: https://netlify.com/
- **Railway**: https://railway.app/
- **PlanetScale**: https://planetscale.com/
- **Heroku**: https://heroku.com/

## 🆘 Troubleshooting

### Common Issues

1. **Build Failures**: Check package.json dependencies
2. **API Errors**: Verify backend URL and CORS settings
3. **Database Issues**: Check connection strings and permissions
4. **Authentication**: Ensure JWT secret is set
5. **File Uploads**: Configure storage service for production

### Support

If you encounter deployment issues:
1. Check the deployment logs
2. Verify all environment variables
3. Test API endpoints manually
4. Check CORS configuration
5. Ensure database is accessible

---

**Happy Deploying! 🚀**
