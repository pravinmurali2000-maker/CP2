# Sports Tournament Manager Application Documentation

This document provides a comprehensive overview of the Sports Tournament Manager application, covering its architecture, frontend functionality, and backend services.

## 1. Introduction

The Sports Tournament Manager is a web application designed to facilitate the organization, management, and tracking of sports tournaments. It supports various user roles (Admin, Manager, Viewer) with distinct functionalities, including tournament setup, team and player management, match scheduling, live score updates, and real-time notifications.

## 2. Architecture Overview

The application follows a client-server architecture:

-   **Frontend (Client)**: Built with **React** (using Vite for development) and **TypeScript**, providing an interactive user interface. It communicates with the backend via RESTful APIs and WebSockets.
-   **Backend (Server)**: Developed using **NestJS**, a progressive Node.js framework, and **TypeScript**. It exposes RESTful APIs, handles business logic, interacts with the database, and provides real-time updates via WebSockets.
-   **Database**: Utilizes **MySQL** as the primary data store, managed through **TypeORM**.

**Key Technologies:**
-   **Frontend**: React, TypeScript, Vite, shadcn/ui (for UI components), Lucide React (for icons), Sonner (for toasts), Socket.IO Client.
-   **Backend**: NestJS, TypeScript, TypeORM, MySQL, Passport.js (for authentication), JWT (for authorization), bcrypt (for password hashing), class-validator/class-transformer (for DTO validation), Socket.IO.

## 3. Frontend Functionality

The frontend application provides a dynamic user interface that adapts based on the user's authentication status and role.

### 3.1 Core Components and Routing (`src/App.tsx`)

-   **`App.tsx`**: The main application component that manages global state (current page, current user, tournament data) and handles routing based on the `currentPage` state variable.
-   **`TournamentProvider` (`src/context/TournamentContext.tsx`)**: A React Context provider that fetches and manages the global `tournament` state, making it available to all child components via the `useTournament` hook. It also exposes `setTournament` for updating the global state.

### 3.2 User Authentication and Navigation

-   **`Login.tsx`**: Handles user authentication for 'admin' and 'manager' roles. Upon successful login, sets the `currentUser` and navigates to the respective dashboard.
-   **`Navigation.tsx`**: Displays a responsive navigation bar with links that vary based on the `currentUser`'s role (Admin, Manager, Viewer). Uses `onNavigate` to change the `currentPage` state in `App.tsx`.

### 3.3 Main Pages and Features

**Public/Viewer Pages:**
-   **`PublicLanding.tsx`**: The initial landing page displaying public tournament information like name, format, team count, urgent notifications, current standings (top 5), upcoming matches, and recent results. Provides login buttons for Admin and Manager.
-   **`Standings.tsx`**: Displays the full league table, sorted by points, goal difference, and goals scored. (Accessible by all roles).
-   **`Fixtures.tsx`**: Shows a list of all matches, grouped by date, with filtering options for "all", "upcoming", and "completed" matches. (Accessible by all roles).
-   **`Notifications.tsx`**: Displays a history of all tournament notifications.

**Admin-Specific Pages:**
-   **`AdminDashboard.tsx`**: A central hub for administrators, providing an overview of tournament statistics (total teams, completed/upcoming matches, status) and navigation cards to all admin management functionalities.
-   **`TournamentSetup.tsx`**: Allows administrators to:
    -   Update core tournament details (name, format, start date, end date).
    -   Manage the match schedule: generate a round-robin schedule based on matches per day and time slot intervals, or clear all existing matches.
-   **`TeamManagement.tsx`**: Enables administrators to:
    -   View a list of all participating teams.
    -   Add new teams with manager details (name, email).
    -   Edit existing team details.
    -   Delete teams (with confirmation).
-   **`MatchScheduling.tsx`**: Provides a UI for administrators to manually edit the date, time, and venue for individual matches.
-   **`LiveScoreInput.tsx`**: Allows administrators to input and save final scores for scheduled or in-progress matches, which automatically updates standings and triggers real-time notifications.
-   **`Notifications.tsx`**: (Admin view) Includes a form to compose and send new notifications (normal or urgent) to all tournament participants.

**Manager-Specific Pages:**
-   **`TeamManagerView.tsx`**: Displays an overview of the manager's assigned team, including team stats, player roster, and quick actions. Allows managers to:
    -   Edit their team's details (name, manager name, manager email).
    -   Delete their team (with confirmation and redirection).
-   **`TeamRegistration.tsx`**: Enables managers to register new players to their assigned team by providing player name, number, and position.

### 3.4 API Interaction and Real-time Updates

-   **`api.ts`**: A utility for making RESTful API calls to the backend using `fetch`, handling request headers (including JWT token for authorization) and response parsing/error handling.
-   **WebSockets**: Uses `socket.io-client` to connect to the backend's WebSocket gateway (`http://localhost:3001`). It listens for real-time updates for `match_score_updated` (to refresh standings) and `notification_sent` (to display toasts).

## 4. Backend Functionality

The backend is built with NestJS, providing a structured and modular approach to API development.

### 4.1 Modules

-   **`AppModule`**: The root module, configuring global aspects like `ConfigModule` (for environment variables) and `TypeOrmModule` (for database connection).
-   **`AuthModule`**: Manages user authentication, including login endpoints and JWT strategy for guarding routes.
-   **`TournamentsModule`**: Handles all operations related to tournaments, teams, players, schedules, and notifications. This is the largest module.
-   **`MatchesModule`**: Manages operations specific to individual matches, primarily score updates.
-   **`RealtimeModule`**: Integrates Socket.IO for real-time communication, broadcasting updates to connected clients.

### 4.2 Database (TypeORM with MySQL)

-   **Entities**: Defined in `src/database/entities` (e.g., `User`, `Tournament`, `Team`, `Player`, `Match`, `Notification`). These map directly to database tables.
-   **`schema.sql`**: Provides the SQL schema for MySQL. However, with `synchronize: true` in `TypeOrmModule` configuration, the schema is automatically created/updated by TypeORM.
-   **Seeding**: `backend/src/main.ts` includes a `seedDatabase` function that populates the database with initial admin and manager users if they don't already exist.

### 4.3 RESTful API Endpoints (`TournamentsController`, `MatchesController`)

**`TournamentsController` (`/api/tournaments`)**:
-   `GET /:id`: Fetches a single tournament with all its related teams, players, matches, and notifications.
-   `PUT /:id`: Updates a tournament's details (Admin only).
-   `POST /:id/teams`: Creates a new team within a tournament (Admin, Manager).
-   `PUT /:id/teams/:teamId`: Updates a specific team's details (Admin, Manager for their own team).
-   `DELETE /:id/teams/:teamId`: Deletes a specific team (Admin only).
-   `POST /:id/teams/:teamId/players`: Creates a new player for a specific team (Admin, Manager).
-   `POST /:id/schedule/generate`: Generates a round-robin schedule for the tournament (Admin only).
-   `DELETE /:id/schedule`: Clears all matches for the tournament (Admin only).
-   `POST /:id/notifications`: Creates and broadcasts a new notification (Admin only).
-   `GET /:id/standings`: Calculates and returns the current standings for the tournament.

**`MatchesController` (`/api/matches`)**:
-   `PUT /:id`: Updates a match's details (date, time, venue) (Admin only).
-   `POST /:id/score`: Updates the score and status of a match to 'completed'. Triggers standings recalculation and broadcasts score updates via WebSocket (Admin only).

### 4.4 Authentication and Authorization (`AuthModule`)

-   **Login (`/api/auth/login`)**: Takes email and password, validates against stored credentials (hashed using `bcrypt`), and returns a JWT access token upon success.
-   **`JwtAuthGuard`**: Protects routes, ensuring only authenticated users can access them.
-   **`RolesGuard` & `Roles` Decorator**: Implements Role-Based Access Control (RBAC), allowing specific routes to be restricted to 'admin', 'manager', or 'viewer' roles.

### 4.5 Real-time Communication (`RealtimeModule`)

-   **`RealtimeGateway`**: A Socket.IO gateway that manages WebSocket connections.
-   **Events**:
    -   `join_tournament_room`: Clients join a specific room for a tournament ID to receive relevant updates.
    -   `match_score_updated`: Broadcasts updated standings after a match score is saved.
    -   `notification_sent`: Broadcasts new notifications to all connected clients in the tournament room.

## 5. DTOs (Data Transfer Objects)

DTOs (e.g., `LoginDto`, `UpdateTournamentDto`, `CreateTeamDto`, `CreatePlayerDto`, `GenerateScheduleDto`, `UpdateScoreDto`, `CreateNotificationDto`, `UpdateMatchDto`) are used for defining the structure and validation rules for data exchanged between the frontend and backend. They leverage `class-validator` and `class-transformer` for robust input validation.

## 6. Known Issues / Considerations

-   The UI components (shadcn/ui/Radix UI) may sometimes emit React warnings about `refs` (e.g., "Function components cannot be given refs") or missing accessibility descriptions. While these are not critical errors and don't typically break functionality, they indicate areas for potential further refinement in a production environment.
-   `npm test` is currently not configured or working in the root `package.json`. The frontend uses `vitest` which might need manual execution or correct setup in `package.json` for CI/CD.

This document serves as a guide to understanding the various components and interactions within the Sports Tournament Manager application.
