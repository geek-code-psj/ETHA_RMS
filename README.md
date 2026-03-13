
# RenderHRMS - Production Human Resource Management System

A resilient, professional HR portal optimized for the **Render 2026 Free Tier**, built with Next.js, TypeScript, and Tailwind CSS.

## Technical Architecture
- **Frontend**: Next.js 15 (App Router) deployed as a Render Static Site for always-on availability and SEO.
- **Backend**: Cloud Firestore for scalable, multi-tenant data management with real-time synchronization.
- **Security**: Firebase Authentication for secure admin access (Email/Password & Anonymous Guest modes).
- **Resilience Layer**: Implements a simulated "Cold Start" handler and waking indicator to manage user expectations during initial server-side handshakes.

## Key Features
- **Comprehensive Employee Directory**: Full CRUD management of staff records with profile avatars.
- **Daily Attendance Grid**: Real-time status logging (Present, Absent, Late) with automatic persistence.
- **Internal Task Pipeline**: Track HR priorities and onboarding requirements with a dedicated Kanban-style view.
- **Admin Dashboard**: Real-time organizational health metrics and staff growth monitoring.

## Deployment on Render
- **Dashboard URL**: [Your Render Static Site URL]
- **Environment**: Node.js 20+
- **Build Command**: `npm run build`
- **Output Directory**: `out` (if static) or standard Web Service.

## Resilience Strategy
To handle Render's free tier cold starts, the application uses an asynchronous "Waking" indicator. While the frontend remains responsive, critical data handshakes are visualized through a progressive loading bar, ensuring a professional and transparent user experience.
