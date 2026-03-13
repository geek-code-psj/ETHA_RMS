
# ETHA_RMS - Production Human Resource Management System

A resilient HRMS monorepo optimized for **Render 2026 Free Tier**.

## Architecture
- **/frontend**: Next.js 15 (App Router) - Deployed as a Render Static Site.
- **/backend**: FastAPI (Python 3.11) - Deployed as a Render Web Service.
- **Database**: Render PostgreSQL with exponential backoff retry logic.

## Resilience Strategy
To handle Render's cold starts, the backend implements a custom Python decorator that retries database connections up to 5 times with exponential backoff. The frontend displays a "Waking up Python Server..." progress bar if the API is non-responsive during initial handshake.

## Deployment Instructions
1. Push this monorepo to your GitHub: `https://github.com/geek-code-psj/ETHA_RMS.git`
2. Render will automatically detect the `render.yaml` blueprint.
3. The Static Site will be "Always On," while the Web Service will sleep after 15 minutes of inactivity.
