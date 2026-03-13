# ETHA_RMS: Enterprise Human Resource Management System

A production-grade HRMS monorepo optimized for **Render 2026 Free Tier** high-availability and resilience.

## 🚀 Live Links
- **Application (Frontend):** [https://etha-rms-frontend.onrender.com](https://etha-rms-frontend.onrender.com)
- **API (Backend):** [https://etha-rms-backend.onrender.com](https://etha-rms-backend.onrender.com)
- **GitHub Repository:** [https://github.com/geek-code-psj/ETHA_RMS.git](https://github.com/geek-code-psj/ETHA_RMS.git)

## 🏗️ Architecture
This project is organized as a **Monorepo** to ensure tight coupling between frontend schemas and backend logic.

- **/backend**: Powered by **FastAPI** and **SQLAlchemy**. FastAPI was selected for its extremely low memory footprint (idle ~30MB), making it ideal for Render's 512MB RAM free tier while maintaining high performance.
- **/frontend**: Built with **Next.js 15 (App Router)** and **Tailwind CSS**. Deployed as a Render Static Site for "Always On" availability.
- **Database**: **Render PostgreSQL** (Free Instance).

## 🛡️ Resilience & Cold-Start Handling
Render's free tier spins down web services after 15 minutes of inactivity. ETHA_RMS implements two critical layers to maintain a professional UX:

1.  **Backend Resilience Layer**: A custom Python **Retry Decorator** with exponential backoff manages the PostgreSQL connection. This ensures the backend doesn't crash during the 30-60 second "waking up" phase of a cold Render database.
2.  **Intelligent Loading UI**: The Next.js frontend detects API latency. If the backend is non-responsive during the initial handshake, a prominent **"Waking up Python Server..."** progress bar is displayed using the Inter font, managing user expectations during cold starts.

## 🛠️ Setup Instructions

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
# Set DATABASE_URL in your environment
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## ⚠️ Assumptions
- **Database Longevity**: The system utilizes the Render Free PostgreSQL tier, which expires 30 days after creation.
- **Environment**: All secrets and connection strings are managed via Render Environment Variables.

---
© 2026 ETHA_RMS Team. Built for Resilience.