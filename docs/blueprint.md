# **App Name**: RenderTasks

## Core Features:

- Static Site Frontend Deployment: Deploy the Next.js/TypeScript frontend, styled with Tailwind CSS, as a Render Static Site for instant loading and 24/7 availability.
- Robust FastAPI Backend API: Implement a data API using FastAPI and SQLAlchemy ORM, strictly defining data schemas with Pydantic models for robust data exchange.
- Intelligent Backend Waking UI: Display a professional 'Waking up Python Server...' progress bar with the Inter font if the backend API returns a 503 or takes longer than 2 seconds to respond.
- Resilient PostgreSQL Connection: Integrate with Render PostgreSQL, implementing a custom 'Retry' decorator with exponential backoff (5 attempts) for database connections to handle cold start delays.
- Comprehensive Task Management: Provide full Create, Read, Update, and Delete (CRUD) operations for a 'Tasks' entity, demonstrating complete full-stack data flow and interaction.
- Monorepo Project Structure: Maintain an organized monorepo with separate '/backend' (Python) and '/frontend' (Next.js/TypeScript) directories for streamlined development and deployment.

## Style Guidelines:

- A modern, clean color palette with a primary focus on cool blues and grays for professionalism and clarity. Accent colors to highlight interactive elements and status indicators, aligning with Tailwind CSS defaults.
- Utilize the 'Inter' typeface across the application for its modern, highly readable, and versatile characteristics, ensuring a professional look, especially for status messages like 'Waking up Python Server...'
- Adopt minimalist, outline-style icons from Lucide-React to ensure a clean, consistent, and professional visual language throughout the UI. Icons should clearly represent actions (e.g., save, delete) and status indicators (e.g., loading, error).
- Employ a responsive and spacious layout structured with Tailwind CSS, prioritizing clear content hierarchy, ample whitespace, and intuitive navigation across various devices. Critical information, such as loading states, should be prominently displayed.
- Subtle and functional animations, including a progressive loading bar for the 'Waking up Python Server...' state, to provide clear user feedback without distractions.