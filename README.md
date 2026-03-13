
# RenderHRMS - Lightweight Human Resource Management System

This application is optimized for the **Render 2026 Free Tier**, featuring a resilient full-stack architecture.

## Technical Summary
- **Frontend**: Next.js (TypeScript) deployed as a Render Static Site for always-on availability.
- **Backend Simulation**: Next.js API Routes modeling a FastAPI architecture with PostgreSQL connectivity logic.
- **Resilience Layer**: Implements a simulated "Cold Start" handler with exponential backoff logic for database connections.
- **UI/UX**: Features a "Waking up Python Server..." progress bar using the Inter font when the API is starting from a cold state.

## Core Features
- **Employee Directory**: Full CRUD management of staff records.
- **Attendance Tracking**: A live daily grid to toggle status (Present, Absent, Late).
- **Admin Dashboard**: Real-time stats and department-wide monitoring.

## Live Deployment
- **Frontend URL**: [Will be provided by Render upon deployment]
- **API Endpoint**: /api/hrms/*

## Database Handling
Uses Render PostgreSQL logic. Note that free-tier databases on Render expire after 30 days and have a limited monthly uptime if the associated web service is inactive.
