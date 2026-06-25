# Real-Time Dish Management Dashboard

A modern, responsive, full-stack dashboard application built with **React.js** (Vite), **Node.js/Express**, **PostgreSQL**, and **Socket.io** for real-time synchronization.

This dashboard displays a list of culinary dishes and allows administrators to toggle their "Published" or "Hidden" status. When a status is toggled, it is updated in the database and immediately synchronized across all connected client browsers via WebSockets.

---

## Technical Stack
- **Frontend**: React.js (Vite, Javascript, Vanilla CSS with custom theme variables, animations & glassmorphism elements)
- **Backend**: Node.js, Express.js, Socket.io
- **Database**: PostgreSQL (connected via the native `pg` package)
- **Real-Time**: WebSockets via Socket.io

---

## Directory Structure
- `client/`: React client code (Vite environment)
- `server/`: Express server, database schema, and data seeding scripts
- `.env`: Database credentials and server ports configuration
- `.env.example`: Configuration variables template

---

## Prerequisites
Ensure the following are installed on your machine:
1. **Node.js** (v16.0.0 or later) and **npm**
2. **PostgreSQL** database server running locally

---

## Setup & Running Instructions

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the root folder:
```bash
cp .env.example .env
```
Open the `.env` file and edit the database connection parameters to match your local PostgreSQL configuration:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dish_dashboard
DB_USER=postgres
DB_PASSWORD=your_password
```

### 2. Install Dependencies
Run `npm install` in both the server and client folders.

For the backend:
```bash
cd server
npm install
```

For the frontend:
```bash
cd ../client
npm install
```

### 3. Initialize & Seed Database
The seeding script will automatically check if the target database (e.g. `dish_dashboard`) exists. If it does not, the script will attempt to connect to the default `postgres` database, create the `dish_dashboard` database, build the tables schema from `schema.sql`, and seed initial data from `dishes.json`.

Run the seed command in the `server` directory:
```bash
cd server
npm run seed
```

### 4. Run the Application

#### A. Start the Express Backend Server
Run from the `server` directory:
```bash
npm run dev
```
The server will start on port `5000` (or the PORT configured in `.env`).

#### B. Start the React Frontend Development Server
Open a new terminal window, navigate to the `client` directory, and run:
```bash
npm run dev
```
By default, Vite will start the frontend on `http://localhost:5173`.

---

## API Documentation

### 1. Fetch All Dishes
- **Endpoint**: `GET /api/dishes`
- **Description**: Returns all dishes stored in the database.
- **Response**: `200 OK`
  ```json
  [
    {
      "dish_id": "dish-1",
      "dish_name": "Gourmet Margherita Pizza",
      "image_url": "https://images.unsplash.com...",
      "is_published": true
    }
  ]
  ```

### 2. Toggle Published Status
- **Endpoint**: `PATCH /api/dishes/:dishId/toggle`
- **Description**: Inverts the `is_published` status for the specified dish ID in the database and broadcasts the change via Socket.io.
- **Response**: `200 OK` (Updated dish object)
  ```json
  {
    "dish_id": "dish-1",
    "dish_name": "Gourmet Margherita Pizza",
    "image_url": "https://images.unsplash.com...",
    "is_published": false
  }
  ```

---

## Real-Time Sync & Optimistic UI Features
1. **Optimistic UI Updates**: Toggling a dish immediately updates the toggle switch in the UI. If the server fails to update (e.g., database timeout), the toggle automatically reverts to its original state, and a warning notifies the user.
2. **WebSocket Sync**: When a status is changed, a Socket.io event `dishUpdated` is emitted. All other open tabs/clients will receive this event, update their state, and show a visual **amber pulse highlight** on the changed dish card.
