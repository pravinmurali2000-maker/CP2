# Sports Tournament Manager Application Documentation

This document provides a comprehensive overview of the Sports Tournament Manager application, covering its architecture, features, and deployment process.

## 1. Introduction

The Sports Tournament Manager is a full-stack web application designed to facilitate the organization, management, and real-time tracking of sports tournaments. It supports various user roles (Admin, Manager) with distinct functionalities, including tournament setup, team and player management, automated match scheduling, live score updates, and real-time notifications to all viewers.

## 2. Architecture Overview

The application is architected as a modern, decoupled JAMstack application. The frontend and backend are separate projects that are developed and deployed independently.

-   **Frontend (Client)**: A single-page application (SPA) built with **React** (using Vite) and **TypeScript**. It provides a dynamic, interactive user interface and is deployed globally on **Netlify's CDN** for high performance.
-   **Backend (Server)**: A monolithic API server developed with **NestJS** and **TypeScript**. It exposes RESTful APIs, handles all business logic, manages user authentication, and provides real-time updates via WebSockets. It is deployed as a **Web Service on Render**.
-   **Database**: A **PostgreSQL** database managed by **Render's Managed PostgreSQL** service. This serves as the primary, persistent data store for the application.

### 2.1 Technology Stack

-   **Frontend**: React, TypeScript, Vite, TailwindCSS, shadcn/ui, Socket.IO Client.
-   **Backend**: NestJS, TypeScript, TypeORM, PostgreSQL, Passport.js (for JWT authentication), Socket.IO.
-   **Deployment**:
    -   **Frontend:** Netlify (for hosting and CI/CD).
    -   **Backend & Database:** Render (for hosting, CI/CD, and managed PostgreSQL).

### 2.2 Data Flow & Real-time Updates

1.  **Initial Load**: A user accesses the frontend URL (hosted on Netlify). The React application fetches the initial tournament data from the backend API (hosted on Render).
2.  **API Requests**: User actions (like an admin saving a match score) trigger secure API calls from the frontend to the backend.
3.  **Backend Logic**: The NestJS backend processes the request, interacts with the PostgreSQL database (via TypeORM), and performs the necessary action.
4.  **Real-time Broadcast**: After a significant change (like a score update), the backend uses a WebSocket gateway to broadcast the entire updated tournament object to all connected clients.
5.  **Frontend Update**: The frontend receives the `tournament_updated` event and updates its global state, causing the UI to re-render with the new information in real-time, without requiring a page refresh.

## 3. Frontend Functionality

The frontend application provides a dynamic user interface that adapts based on the user's authentication status and role.

### 3.1 Core Components and State Management (`src/App.tsx`)

-   **`App.tsx`**: The main application component that manages global state (current page, current user, tournament data) and handles routing.
-   **`TournamentProvider` (`src/context/TournamentContext.tsx`)**: Fetches and manages the global `tournament` state via the `useTournament` hook, making it available to all child components.
-   **API URL**: The frontend is configured to communicate with the backend API via the `VITE_API_URL` environment variable, allowing for easy switching between local development and the live production backend.

### (Sections 3.2, 3.3 for specific features remain largely the same)

## 4. Backend Functionality

The backend is built with NestJS, providing a structured and modular approach to API development.

### 4.1 Modules

-   **`AppModule`**: The root module, configuring global aspects like `ConfigModule` and `TypeOrmModule`.
-   **`AuthModule`**: Manages user authentication and JWT strategy.
-   **`TournamentsModule`**: Handles all operations related to tournaments, teams, players, schedules, and notifications.
-   **`MatchesModule`**: Manages operations specific to individual matches.
-   **`RealtimeModule`**: Integrates Socket.IO for real-time communication.

### 4.2 Database (TypeORM with PostgreSQL)

-   **Entities**: Defined in `src/database/entities`.
-   **Configuration**: `app.module.ts` is configured to connect to the database using a single `DATABASE_URL` environment variable, making it compatible with managed hosting services like Render. It's configured for PostgreSQL and includes SSL settings for secure connections.
-   **Seeding**: `backend/src/main.ts` includes a `seedDatabase` function that populates the database with an initial admin user, manager users, and a default tournament if the database is empty. This is crucial for the first deployment.

### (Section 4.3 for API endpoints remains largely the same)

### 4.4 Real-time Communication (`RealtimeModule`)

-   **`RealtimeGateway`**: A Socket.IO gateway that manages WebSocket connections.
-   **Events**:
    -   `join_tournament_room`: Clients join a room for a specific tournament ID.
    -   `tournament_updated`: Broadcasts the entire, updated tournament object to all clients in the room after a significant change (e.g., score update, match detail change). This is the primary mechanism for real-time UI updates.
    -   `notification_sent`: Broadcasts new notifications.

## 5. Deployment Guide

This application is designed for a simple and modern continuous deployment workflow using Render and Netlify.

### 5.1 Prerequisites

-   A GitHub account with the project repository pushed.
-   A Render account.
-   A Netlify account.

### 5.2 Part 1: Deploying the Backend on Render

1.  **Create the Database:**
    -   On the Render dashboard, create a new **PostgreSQL** database.
    -   Once created, copy the **Internal Database URL**.

2.  **Create the Web Service:**
    -   On the Render dashboard, create a new **Web Service**.
    -   Connect it to your GitHub repository.
    -   **Configuration:**
        -   **Build Command:** `npm install && npm run build`
        -   **Start Command:** `npm run start:prod`
        -   **Environment Variables:**
            -   `DATABASE_URL`: Paste the Internal Database URL from the previous step.
            -   `JWT_SECRET`: Provide a strong, randomly generated string.

3.  **Deploy:**
    -   Finish the setup. Render will automatically deploy the service. Upon the first deployment, the `seedDatabase` function will run, populating the database with a default tournament and users.
    -   Once live, copy the public URL of your service (e.g., `https://your-app.onrender.com`).

### 5.3 Part 2: Deploying the Frontend on Netlify

There are two methods: Git-based deployment (recommended) or manual deployment.

**Method A: Git-Based Deployment (Recommended)**

1.  **Create a New Site:**
    -   On Netlify, create a new site by importing an existing project from GitHub.
    -   Select your repository.

2.  **Configure Build Settings:**
    -   **Branch to deploy:** `production` (or your main branch).
    -   **Build command:** `npm install && npm run build`
    -   **Publish directory:** `build` (as configured in `vite.config.ts`).
    -   **Environment Variable:**
        -   **Key:** `VITE_API_URL`
        -   **Value:** `https://<your-render-url>/api` (e.g., `https://cp2-unfv.onrender.com/api`).

3.  **Deploy:**
    -   Click "Deploy site". Netlify will build and deploy the frontend. Any future push to the `production` branch will trigger an automatic redeployment.

**Method B: Manual Deployment**

1.  **Create `.env.production` file:**
    -   In your local project root, create a file named `.env.production`.
    -   Add one line: `VITE_API_URL=https://<your-render-url>/api`.

2.  **Build Locally:**
    -   Run `npm install && npm run build` in your terminal. This will create a `build` folder.

3.  **Upload to Netlify:**
    -   On the Netlify "Sites" page, find the drag-and-drop area.
    -   Drag your local `build` folder and drop it there.

### 5.4 Default Login Credentials

After deployment and database seeding, you can use the following default accounts:

-   **Admin Account**
    -   **Email:** `admin@tournament.my`
    -   **Password:** `admin123`
-   **Manager Account**
    -   **Email:** `ahmad@fcpj.my`
    -   **Password:** `manager123`
