# Jira-Style Task Management System

A modern full-stack **Task Management System** inspired by Jira. Manage projects and tasks efficiently through a secure, responsive, and user-friendly platform featuring Kanban drag-and-drop, task assignment, file attachments, and real-time status tracking.

---

## Features

### Authentication & Security
- User registration (Name, Email, Password)
- JWT-based login with secure HttpOnly cookies (access + refresh tokens)
- Forgot password / reset password via email
- Protected routes — authenticated users only
- Rate limiting on all API endpoints

### Task Management (CRUD)
- Create tasks with title, description, priority, due date, assignee, and labels
- Edit all task fields including status, assignee, and attachments
- Delete tasks with confirmation
- View full task detail (status history, attachments, creation/update dates)

### Kanban Board (Drag & Drop)
- Five Jira-style workflow columns: **Idea → To Do → In Progress → In Review → Completed**
- Drag-and-drop cards across columns — status auto-updates in the database
- Task list view with search, filters, and sorting

### Task Assignment
- Assign tasks to any registered user
- View tasks assigned to you or created by you

### File Attachments
- Upload images, PDFs, and documents to tasks
- Attach files during task creation or later via the edit flow

### Dashboard
- Six overview cards: Total, Idea, To Do, In Progress, In Review, Completed
- Priority breakdown (Critical, High, Medium, Low)
- Assigned-to-me list and recent activity stream

### User Profile
- Update name and timezone
- Change account password

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, Vite, Tailwind CSS, React Query, React Hook Form |
| Backend   | Node.js, Express 4, Zod validation, JWT, Multer |
| Database  | MongoDB + Mongoose |
| Security  | Helmet, CORS, bcrypt, HttpOnly cookies, rate limiting |
| Container | Docker, Docker Compose |

---

## Project Structure

```
My Tracker/
├── docker-compose.yml          # Orchestrates all services
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── api/                # Axios API wrappers
│   │   ├── components/
│   │   │   ├── common/         # Avatar, PriorityBadge, StatusBadge
│   │   │   ├── kanban/         # KanbanBoard, TaskCard (drag-and-drop)
│   │   │   ├── layout/         # AppShell, Sidebar, Topbar, MobileNav
│   │   │   ├── tasks/          # TaskFormModal, TaskDetailModal, TaskListView
│   │   │   └── ui/             # Button, Input, Modal, Spinner, Badge
│   │   ├── context/            # AuthContext, ThemeContext
│   │   ├── pages/              # DashboardPage, TasksPage, ProfilePage, auth/*
│   │   ├── routes/             # AppRouter, ProtectedRoute
│   │   └── utils/              # constants, dates
│   └── Dockerfile
└── server/                     # Express REST API
    ├── src/
    │   ├── config/             # db.js, env.js
    │   ├── controllers/        # auth, tasks, dashboard, profile
    │   ├── middleware/         # auth, errorHandler, rateLimiter, upload, validate
    │   ├── models/             # Task, User
    │   ├── routes/             # auth, tasks, profile, misc (dashboard)
    │   ├── services/           # email.service, token.service
    │   └── utils/              # ApiError, ApiResponse, asyncHandler
    ├── uploads/                # Uploaded task attachments
    └── Dockerfile
```

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- Node.js ≥ 18 (for local development without Docker)

### Run with Docker (Recommended)

```bash
# Clone the repository
git clone <repo-url>
cd "My Tracker"

# Start all services (MongoDB + API + React)
docker-compose up --build
```

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost        |
| Backend  | http://localhost:5000   |
| MongoDB  | localhost:27017         |

### Local Development (without Docker)

**Backend:**
```bash
cd server
cp .env.example .env    # Fill in your values
npm install
npm run dev
```

**Frontend:**
```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`, backend at `http://localhost:5000`.

---

## Environment Variables

### Server (`server/.env`)

| Variable               | Description                          | Required |
|------------------------|--------------------------------------|----------|
| `MONGODB_URI`          | MongoDB connection string            | ✅       |
| `JWT_ACCESS_SECRET`    | Secret for access tokens (≥ 32 chars)| ✅       |
| `JWT_REFRESH_SECRET`   | Secret for refresh tokens            | ✅       |
| `CLIENT_URL`           | Frontend origin for CORS             | ✅       |
| `EMAILJS_SERVICE_ID`   | EmailJS service (password reset)     | Optional |
| `EMAILJS_TEMPLATE_ID`  | EmailJS template ID                  | Optional |
| `EMAILJS_PUBLIC_KEY`   | EmailJS public key                   | Optional |
| `EMAILJS_PRIVATE_KEY`  | EmailJS private key                  | Optional |

---

## API Endpoints

### Auth — `/api/v1/auth`
| Method | Endpoint                | Description          |
|--------|-------------------------|----------------------|
| POST   | `/register`             | Create account       |
| POST   | `/login`                | Log in               |
| POST   | `/logout`               | Log out              |
| POST   | `/refresh`              | Refresh access token |
| POST   | `/forgot-password`      | Request reset email  |
| POST   | `/reset-password/:token`| Reset password       |
| GET    | `/me`                   | Current user info    |
| GET    | `/users`                | List users (for assignee dropdown) |

### Tasks — `/api/v1/tasks`
| Method | Endpoint              | Description                   |
|--------|-----------------------|-------------------------------|
| GET    | `/`                   | List / search tasks           |
| POST   | `/`                   | Create task                   |
| GET    | `/:id`                | Get task details              |
| PUT    | `/:id`                | Update task                   |
| DELETE | `/:id`                | Delete task                   |
| PATCH  | `/:id/status`         | Update task status            |
| POST   | `/:id/attachments`    | Upload attachment              |
| DELETE | `/:id/attachments/:key` | Remove attachment           |

### Dashboard — `/api/v1/dashboard`
| Method | Endpoint | Description                   |
|--------|----------|-------------------------------|
| GET    | `/`      | Overview cards + activity     |

### Profile — `/api/v1/profile`
| Method | Endpoint    | Description          |
|--------|-------------|----------------------|
| PUT    | `/`         | Update profile       |
| PUT    | `/password` | Change password      |

---

## Kanban Workflow

```
Idea  →  To Do  →  In Progress  →  In Review  →  Completed
```

Drag any task card from one column to another. The status change is persisted to the database and logged in the task's status history.

---

## License

MIT
