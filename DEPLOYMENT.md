# MineGuard AI — Production Cloud Deployment & Student Benefits Guide

This guide details how to deploy **MineGuard AI** to the cloud completely **free of cost**, take advantage of student developer benefits, and obtain a live, shareable public URL for your project presentation and patent portfolio.

---

## 1. Student Subscriptions & Free Tier Breakdown

### A. Do You Need a Paid Subscription?
**No.** You can deploy and run this entire full-stack project **100% free forever** without entering any credit card information:
- **Vercel Hobby Tier:** Completely free for personal/academic projects. Provides unlimited automatic deployments from GitHub, global edge CDN, and free SSL certificates (`*.vercel.app`).
- **Render Free Tier:** Provides 750 free instance hours per month (enough to run your backend 24/7) with automatic SSL (`*.onrender.com`). *Note: Render free services spin down after 15 minutes of inactivity and take ~30–45 seconds to wake up on the first request (cold start).*

---

### B. GitHub Student Developer Pack (Optional Superpowers)
If you are a student with an institutional email (`.edu`, `.ac.in`, etc.) or college ID card, you can claim the **[GitHub Student Developer Pack](https://education.github.com/pack)** for free:

| Benefit | Provider | Value | How to Use in MineGuard AI |
| :--- | :--- | :--- | :--- |
| **Free Custom Domain (1 Year)** | Namecheap (`.me`) or Name.com (`.tech`, `.live`) | ~$15–$30 | Point a real domain (e.g. `mineguard-ai.me`) to your Vercel deployment. |
| **$200 Cloud Hosting Credits** | DigitalOcean | $200 (1 Year) | Run a dedicated Droplet or App Platform container with zero cold starts. |
| **$100 Azure Cloud Credits** | Microsoft Azure for Students | $100 (No credit card) | Host the FastAPI backend on Azure App Service. |
| **$13/Month Dyno Credits** | Heroku | ~$156/yr | Deploy Python dynos without free tier sleep limitations. |
| **GitHub Pro** | GitHub | Free | Pro profile badge, advanced repository insights, unlimited private repos. |
| **JetBrains IDEs** | JetBrains | Full Suite | Free license for PyCharm Professional, WebStorm, DataGrip, etc. |

**To claim the pack:** Visit [education.github.com/pack](https://education.github.com/pack), click **Sign up for Student Developer Pack**, and verify with your college email or ID card.

---

## 2. Step-by-Step Deployment Guide

```
+-------------------------------------------------------------+
|                     GitHub Repository                       |
|               https://github.com/<user>/mineguard-ai        |
+------------------------------+------------------------------+
                               |
            +------------------+------------------+
            |                                     |
            v                                     v
+-----------------------+             +-----------------------+
|    Render (Backend)   |             |   Vercel (Frontend)   |
|   Python 3.12 FastAPI |             |   React 19 + Vite     |
|   SQLite + Scikit-ML  |             |   Tailwind + Recharts |
|   mineguard-backend   | <-----------+   mineguard-ai        |
|     .onrender.com     |   REST API  |     .vercel.app       |
+-----------------------+             +-----------------------+
```

---

### Step 1: Push Code to GitHub

1. Open your browser and log in to [github.com](https://github.com).
2. Click the **"+"** icon in the top right &rarr; **New repository**.
3. Name your repository (e.g., `mineguard-ai`).
4. Keep it **Public** (or Private) and **do not** check "Add a README" or ".gitignore" (these already exist in your project).
5. Click **Create repository**.
6. In your local terminal (in `c:\Users\HP\OneDrive\Desktop\Coal Mines Project`), execute:

```powershell
# Link your local repo to your GitHub repository (replace with your GitHub username)
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/mineguard-ai.git

# Push the main branch to GitHub
git push -u origin main
```

---

### Step 2: Deploy Backend to Render (Free)

1. Go to [dashboard.render.com](https://dashboard.render.com) and sign up / log in with your GitHub account.
2. In the Render Dashboard, click the blue **New +** button &rarr; select **Web Service**.
3. Under *Connect a repository*, find and select your `mineguard-ai` repository.
4. Fill in the service configuration:
   - **Name:** `mineguard-backend` (or your preferred name)
   - **Region:** Choose the region closest to you (e.g., Singapore, Frankfurt, or Oregon)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command:**
     ```bash
     python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type:** Select **Free** ($0 / month).
5. Scroll down to **Environment Variables** and add:
   - `PYTHON_VERSION` = `3.12.4`
   - `SECRET_KEY` = `mineguard_production_secret_key_patented_2026`
   - `ALLOWED_ORIGINS` = `*`
   - `DATABASE_URL` = `sqlite:///mineguard.db`
6. Click **Deploy Web Service**.
7. Render will build the environment and start the server. Once deployed, note down your backend URL (e.g., `https://mineguard-backend.onrender.com`).
8. You can verify it by opening `https://mineguard-backend.onrender.com/api/health` in your browser. It should return:
   ```json
   {
     "status": "healthy",
     "engine": "FastAPI + SQLAlchemy + Scikit-Learn",
     "database": "SQLite (mineguard.db)",
     "security": "JWT RBAC + SHA-256 Chained Ledger"
   }
   ```

---

### Step 3: Deploy Frontend to Vercel (Free)

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. From the Vercel dashboard, click **Add New...** &rarr; **Project**.
3. Under *Import Git Repository*, find `mineguard-ai` and click **Import**.
4. In the configuration screen:
   - **Framework Preset:** `Vite` (automatically detected).
   - **Root Directory:** Click **Edit** &rarr; select the `frontend` folder &rarr; click **Continue**.
   - **Build and Output Settings:** Leave default (`npm run build`, output directory `dist`).
   - **Environment Variables:** Expand this section and add:
     - **Name:** `VITE_API_URL`
     - **Value:** `https://mineguard-ai-l9y9.onrender.com` *(active Render backend deployment URL)*
5. Click **Deploy**.
6. Vercel will install dependencies, bundle the TypeScript/Tailwind app, and provide your live public URL (e.g., `https://mineguard-ai-vert.vercel.app`).

---

### Step 4: Verification and Faculty Presentation

1. Open your live Vercel URL (`https://mineguard-ai-vert.vercel.app`) in your browser.
2. Log in using any of the 4 demo roles:
   - **Inspector:** `inspector` / `inspector123`
   - **Mine Manager:** `manager` / `manager123`
   - **Corporate Admin:** `admin` / `admin123`
   - **Regulator / Auditor:** `auditor` / `auditor123`
3. Verify that:
   - KPI cards and charts populate with database records.
   - You can create a new inspection with the AI risk engine calculating scores.
   - The GIS Leaflet map plots the geo-coordinates of the coal mines.
   - SHA-256 Audit Trail displays cryptographic hash integrity.
   - The English / Hindi language toggle functions cleanly.
   - CSV and PDF statutory dossiers download directly to your machine.

> [!TIP]
> **Dealing with Render Free Tier "Cold Start":**
> If your site hasn't been accessed for 15 minutes, Render puts the free backend to sleep. When someone loads the dashboard, the initial API call might take 30–45 seconds to wake up. For college evaluations or live demos, simply open `https://mineguard-ai-l9y9.onrender.com/api/health` 2 minutes before your presentation to wake it up!
