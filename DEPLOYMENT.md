# Railway Deployment Guide for Downstream

## Overview
This application consists of:
- **Backend**: Flask (Python) + PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Storage**: Cloudflare R2 for file uploads

## Deployment Steps

### 1. Prepare for Railway

First, ensure your code is committed to a GitHub repository:
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

### 2. Create Railway Account & Project

1. Go to [railway.app](https://railway.app)
2. Sign up or log in with GitHub
3. Create a new project

### 3. Set Up PostgreSQL Database

In Railway Dashboard:
1. Click "+ New" → "Database" → "PostgreSQL"
2. Railway will automatically create a PostgreSQL instance
3. Note the connection details (you'll need them for environment variables)

### 4. Deploy Backend Service

1. In Railway, click "+ New" → "GitHub Repo"
2. Select your repository
3. Configure the service:
   - **Root Directory**: `server` (important!)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT --workers 4 app:app`

### 5. Set Environment Variables

In Railway, go to your Backend service → Variables:

```
# Database (Railway auto-provides DATABASE_URL)
DATABASE_URL=postgresql://username:password@host:port/database

# Or manually set:
POSTGRESQL_USERNAME=your_username
POSTGRESQL_PASSWORD=your_password
POSTGRESQL_SERVER=your_host
POSTGRESQL_PORT=5432
POSTGRESQL_DATABASE=downstream

# Cloudflare R2
CF_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=downstream-files

# Environment
ENVIRONMENT=production
DOMAIN=your-railway-domain.railway.app

# CORS - Update this to your frontend URL
CORS_ORIGINS=https://your-frontend-domain.com
```

### 6. Deploy Frontend Service

1. Click "+ New" → "GitHub Repo" (same repo)
2. Configure the service:
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm install -g serve && serve -s dist -l 3000`

3. Add Frontend Variables:
```
VITE_API_URL=https://your-backend-url/api
```

### 7. Connect Services

1. In Backend service, add the Frontend URL to `CORS_ORIGINS`
2. In Frontend, ensure `VITE_API_URL` points to your backend Railway domain

### 8. Run Database Migrations

Once the backend is deployed:
1. Go to Backend service → "Connect" → "Shell"
2. Run: `alembic upgrade head`

Alternatively, the Dockerfile runs migrations automatically on start.

### 9. Verify Deployment

1. Visit your frontend URL
2. Test creating a case
3. Test uploading files
4. Check Railway logs for any errors

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `POSTGRESQL_*` | Individual DB credentials | - |
| `CF_ACCOUNT_ID` | Cloudflare Account ID | - |
| `R2_ACCESS_KEY_ID` | R2 Access Key | - |
| `R2_SECRET_ACCESS_KEY` | R2 Secret Key | - |
| `R2_BUCKET_NAME` | R2 Bucket name | `downstream-files` |
| `VITE_API_URL` | Frontend API URL | `https://backend-url` |
| `ENVIRONMENT` | Environment type | `production` |
| `DOMAIN` | Domain name | `your-app.railway.app` |

## Troubleshooting

### Backend won't start
- Check logs: Railway Dashboard → Backend → "Logs"
- Ensure `requirements.txt` is in the correct directory
- Verify PostgreSQL connection string

### Frontend can't connect to backend
- Check `VITE_API_URL` environment variable
- Ensure CORS is properly configured on backend
- Check browser console for API errors

### Database migrations fail
- SSH into backend container and run manually: `alembic upgrade head`
- Check alembic versions table: `SELECT * FROM alembic_version;`

### File uploads fail
- Verify R2 credentials are correct
- Check R2 bucket exists and is accessible
- Verify bucket name in environment variables

## Database Configuration Notes

Railway provides a `DATABASE_URL` automatically. The backend needs to be updated to use it:

Option 1: Use Railway's auto-provided DATABASE_URL
```python
from urllib.parse import urlparse
db_url = os.getenv('DATABASE_URL')
if db_url:
    engine = create_engine(db_url)
```

Option 2: Continue using individual env vars (current setup)
```python
user = os.getenv('POSTGRESQL_USERNAME')
password = os.getenv('POSTGRESQL_PASSWORD')
host = os.getenv('POSTGRESQL_SERVER')
port = os.getenv('POSTGRESQL_PORT', '5432')
db = os.getenv('POSTGRESQL_DATABASE')
db_url = f'postgresql://{user}:{password}@{host}:{port}/{db}'
```

## Scaling & Performance

- **Workers**: Adjust `workers` in Procfile based on load
- **Memory**: Increase Railway plan if needed
- **Database**: Add read replicas for scaling

## Monitoring

Railway provides:
- Real-time logs
- Metrics (CPU, Memory, Disk)
- Error tracking
- Build status

Check these regularly to ensure your application is healthy.
