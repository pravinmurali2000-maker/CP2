# Project Setup Instructions

This guide will walk you through setting up and running the Sports Tournament Manager application on your local machine.

## Prerequisites

-   **Node.js and npm:** Make sure you have Node.js (version 16 or later) and npm installed.
-   **MySQL:** You need a running MySQL server. You can install it using Homebrew (`brew install mysql`) on macOS or by downloading it from the official website for other operating systems.

## 1. Database Setup

### Create the Database

First, you need to create a new database for the application.

1.  Open your MySQL client (e.g., via the `mysql` command in your terminal).
2.  Run the following command to create the database:

    ```sql
    CREATE DATABASE tournament_manager;
    ```

### Configure Environment Variables

The backend needs to connect to your database.

1.  Navigate to the `backend` directory.
2.  You will find a `.env` file. Open it and configure the database connection details. It should look like this:

    ```
    DB_HOST=localhost
    DB_PORT=3306
    DB_USERNAME=root
    DB_PASSWORD=your_mysql_password
    DB_DATABASE=tournament_manager
    JWT_SECRET=your-super-secret-key
    JWT_EXPIRATION_TIME=3600s
    ```

    -   Replace `your_mysql_password` with your actual MySQL root password (or the password for the user you want to use).
    -   The `JWT_SECRET` can be any random string; it's used for securing authentication tokens.

## 2. Backend Setup

### Install Dependencies

Navigate to the `backend` directory in your terminal and install the required packages:

```bash
cd backend
npm install
```

### Start the Backend Server

Once the dependencies are installed, you can start the backend server. The backend uses TypeORM with `synchronize: true` enabled for development, which means it will automatically create the database tables for you based on the entity definitions in the code.

To start the server in development mode (with auto-reloading), run:

```bash
npm run start:dev
```

The backend server will start, and you should see a message indicating that it is running (usually on port 3000).

## 3. Frontend Setup

Open a **new terminal window** for the frontend setup (leave the backend server running).

### Install Dependencies

Navigate to the root directory of the project and install the required packages:

```bash
npm install
```

### Start the Frontend Server

Once the dependencies are installed, you can start the frontend development server:

```bash
npm run dev
```

The command will output a local URL (e.g., `http://localhost:5173`). Open this URL in your web browser to see the application.

## 4. Database Seeding (Optional)

After the backend has started and the tables have been created, you can insert some initial data for testing.

### How to Create Users (Admin and Manager)

User passwords need to be hashed using `bcrypt`. You cannot insert plain text passwords directly. The backend handles this automatically when a user is created through the API, but for manual insertion, you must provide a hash.

For demonstration purposes, let's assume the password for all users is `password123`. The bcrypt hash for `password123` (with 10 salt rounds) is:
`$2b$10$E9.pG5s2s4i8i2r/T6n/d.oG6r/f/G/a/f.H/g.J/i.K/l.M/n`
**Note:** In a real application, you would generate a unique hash for each user.

### SQL Seeding Script

You can run these SQL commands in your MySQL client to add a tournament, three teams, an admin user, and a manager user.

```sql
-- Use the correct database
USE tournament_manager;

-- 1. Insert a tournament
INSERT INTO tournaments (name, format, status) VALUES ('Summer Championship 2025', 'Round Robin', 'draft');

-- Get the ID of the tournament you just inserted (it will likely be 1 if it's the first one)
SET @tournament_id = LAST_INSERT_ID();

-- 2. Insert dummy teams for the tournament
INSERT INTO teams (tournament_id, name, manager_name, manager_email) VALUES
(@tournament_id, 'Red Dragons', 'Michael Lee', 'reddragons@example.com'),
(@tournament_id, 'Blue Sharks', 'Sarah Tan', 'bluesharks@example.com'),
(@tournament_id, 'Golden Eagles', 'Daniel Wong', 'goldeneagles@example.com');

-- Get the ID of the 'Red Dragons' team
SET @team_id = (SELECT id FROM teams WHERE name = 'Red Dragons');

-- 3. Insert an admin user (not assigned to any team)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@example.com', '$2b$10$E9.pG5s2s4i8i2r/T6n/d.oG6r/f/G/a/f.H/g.J/i.K/l.M/n', 'Admin User', 'admin');

-- 4. Insert a manager user and assign them to the 'Red Dragons' team
INSERT INTO users (email, password_hash, name, role, team_id) VALUES
('manager@example.com', '$2b$10$E9.pG5s2s4i8i2r/T6n/d.oG6r/f/G/a/f.H/g.J/i.K/l.M/n', 'Manager User', 'manager', @team_id);
```

You are now all set up! You can log in with the admin user (`admin@example.com`) or the manager user (`manager@example.com`) with the password `password123`.
