# Deploying QMS Suite to Render

## Architecture on Render

```
Browser → qms-frontend (Static/nginx) → calls → qms-backend (Spring Boot) → qms-postgres (PostgreSQL)
```

All 3 services run as separate Render services. The frontend calls the backend directly via HTTPS.

---

## Option A — One-click Blueprint (Recommended)

1. Push this repo to GitHub (make sure `render.yaml` is at the root)
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your GitHub repo
4. Render will read `render.yaml` and create all 3 services automatically
5. Wait ~10 minutes for first build

**After deployment, update the CORS setting:**
- Go to qms-backend service → Environment → `CORS_ALLOWED_ORIGINS`
- Set it to your actual frontend URL (e.g. `https://qms-frontend-abc123.onrender.com`)
- Click Save — backend will redeploy

---

## Option B — Manual Setup (step by step)

### Step 1 — Create PostgreSQL database

1. Render Dashboard → New → PostgreSQL
2. Name: `qms-postgres`
3. Database: `qmsdb`, User: `qmsuser`
4. Plan: Free (or Starter for production)
5. Create → copy the **Internal Database URL**

### Step 2 — Deploy the Backend

1. New → Web Service → Connect GitHub repo
2. Name: `qms-backend`
3. Runtime: **Docker**
4. Dockerfile path: `./qms-backend/Dockerfile`
5. Docker context: `./qms-backend`

**Environment Variables (add all of these):**

| Key | Value |
|-----|-------|
| `SPRING_DATASOURCE_URL` | Internal DB URL from Step 1 (replace `postgres://` with `jdbc:postgresql://`) |
| `SPRING_DATASOURCE_USERNAME` | `qmsuser` |
| `SPRING_DATASOURCE_PASSWORD` | Your DB password from Step 1 |
| `JWT_SECRET` | Any long random string (64+ chars) — use Render's Generate button |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend-name.onrender.com` (update after Step 3) |
| `PORT` | `8080` |
| `PDF_OUTPUT_DIR` | `/tmp/certificates` |

6. Health Check Path: `/actuator/health`
7. Deploy

> **Note on DATABASE_URL format:** Render provides `postgres://user:pass@host/db`.
> Spring needs `jdbc:postgresql://host/db`. Use the values tab approach:
> Set individual `SPRING_DATASOURCE_URL`, `USERNAME`, `PASSWORD` separately.

### Step 3 — Deploy the Frontend

1. New → Web Service → same GitHub repo
2. Name: `qms-frontend`
3. Runtime: **Docker**
4. Dockerfile path: `./qms-frontend/Dockerfile`
5. Docker context: `./qms-frontend`

**Docker Build Arguments (NOT environment variables):**

| Key | Value |
|-----|-------|
| `API_URL` | `https://qms-backend.onrender.com/api` (your actual backend URL) |

> ⚠️ This MUST be a **Build Argument** not an env var — it's baked into the Angular build.

6. Health Check Path: `/health`
7. Deploy

---

## After First Deploy

### Default login credentials
```
Username: admin
Password: admin123
```
Change these immediately in Settings → Users.

### Free tier limitations
- Services **spin down after 15 minutes** of inactivity on the free plan
- First request after spin-down takes 30–60 seconds to respond
- PostgreSQL free tier: 1GB storage, expires after 90 days
- Upgrade to Starter ($7/month per service) for always-on

### Custom domain
1. Frontend service → Settings → Custom Domain
2. Add your domain and follow DNS instructions

---

## Troubleshooting

### "CORS error" on login
- Backend `CORS_ALLOWED_ORIGINS` doesn't include the frontend URL
- Fix: Update the env var in qms-backend → Environment, redeploy

### Flyway migration fails
- Check backend logs for the specific migration error
- Most common: earlier migration already ran, newer one conflicts
- Fix: Connect to DB via Render's psql shell and check `flyway_schema_history`

### Frontend shows blank page
- Check browser console for errors
- Common cause: `API_URL` build arg wasn't set correctly
- Fix: Verify the Docker build arg `API_URL` points to the backend URL

### Backend health check failing
- Spring Boot takes 60–90s to start on free tier (cold start)
- Render health check may timeout → increase start period
- Backend service → Settings → Health Check → Start Period: 120s

---

## Environment Variables Reference

### Backend (qms-backend)
| Variable | Required | Description |
|----------|----------|-------------|
| `SPRING_DATASOURCE_URL` | ✅ | `jdbc:postgresql://host:5432/qmsdb` |
| `SPRING_DATASOURCE_USERNAME` | ✅ | DB username |
| `SPRING_DATASOURCE_PASSWORD` | ✅ | DB password |
| `JWT_SECRET` | ✅ | 64+ char random string for JWT signing |
| `CORS_ALLOWED_ORIGINS` | ✅ | Frontend URL(s), comma-separated |
| `PORT` | ✅ | `8080` |
| `PDF_OUTPUT_DIR` | ⬜ | `/tmp/certificates` (ephemeral on Render) |
| `LAB_NAME` | ⬜ | Your laboratory name |
| `LAB_NABL_CERT` | ⬜ | Your NABL cert number |
| `LAB_ADDRESS` | ⬜ | Lab address for PDF reports |

### Frontend (qms-frontend)
| Variable | Type | Value |
|----------|------|-------|
| `API_URL` | 🔨 Build Arg | `https://qms-backend.onrender.com/api` |

---

## Production Checklist

- [ ] Change admin password
- [ ] Set a strong `JWT_SECRET` (not the default)
- [ ] Update `CORS_ALLOWED_ORIGINS` to exact frontend URL
- [ ] Set `LAB_NAME`, `LAB_NABL_CERT`, `LAB_ADDRESS`
- [ ] Upgrade DB plan from Free to Starter (prevent 90-day expiry)
- [ ] Set up custom domain with HTTPS
- [ ] Enable automatic deploys on push to main branch
