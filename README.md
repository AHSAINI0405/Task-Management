# Jira-Style Task Management System

A modern, full-stack Task Management System inspired by Atlassian Jira, built with React, Node.js, Express, MongoDB, and Tailwind CSS. The application supports 5-stage Jira Kanban workflow management, drag-and-drop task transitions, file attachments (images, PDFs, documents), user assignments, status audit history, overview dashboard metrics, and full Docker containerization.

---

## ✨ Features & Functional Capabilities

### 1. User Authentication & Authorization
- **User Registration (Sign Up)**: Full Name, Email Address, Password, and Confirm Password with client & server validation.
- **User Login**: Secure authentication with hashed passwords (bcrypt) and JWT tokens.
- **Session & Permissions**:
  - Secure HTTP-only cookies and Bearer tokens.
  - Protected routes on both client and server.
  - Ownership & permission checks: users can update tasks they created or are assigned to.

### 2. Task Management (CRUD)
- **Task Identification**: Auto-generated sequential Jira issue keys (e.g. `TASK-101`, `TASK-102`).
- **Create Task**:
  - **Required**: Task Title, Task Description.
  - **Optional**: File Attachments (Images, PDFs, Docs), Due Date, Priority (Low, Medium, High, Critical), Assignee (selectable from registered users), Labels/Tags.
- **Edit Task**: Modify title, description, assignee, priority, status, due date, labels, and attachments.
- **View Task Details (Issue View)**:
  - Task information, key badge, description, labels.
  - Attachments list with image previews, document icons, file sizes, download buttons, and deletion.
  - Assigned user & Reporter/Creator with initialed avatars.
  - Complete **Status History Audit Trail** detailing who moved the task between columns and when.
  - Creation date and relative last updated time.
- **Delete Task**: Permanent task deletion after confirmation modal, including automatic disk cleanup of attached files.

### 3. Task Assignment & Visibility
- Assign tasks to any registered teammate in the system.
- Filter tasks by:
  - **All Tasks**: All accessible team issues.
  - **Assigned to Me**: Quickly view tasks assigned to the current logged-in user.
  - **Created by Me**: Issues reported/created by the current user.
  - Priority filter (Critical, High, Medium, Low).
  - Assignee dropdown filter.
  - Live search across key, summary, description, and labels.

### 4. File Attachment Management
- **Supported Formats**: Images (PNG, JPG, SVG, WebP, GIF), PDF files, Documents (Word, Excel, PowerPoint, Text, Markdown), and Archives (ZIP, RAR).
- **Operations**:
  - Upload attachments during initial task creation.
  - Add additional attachments later directly from the task details view.
  - In-browser preview for image attachments.
  - Direct secure file download with original filenames.
  - Delete individual attachments with server disk cleanup.

### 5. Workflow & Kanban Board
- **5-Stage Kanban Workflow**:
  1. `Idea`: Newly proposed or under discussion.
  2. `To Do`: Approved and ready for development.
  3. `In Progress`: Tasks currently being worked on.
  4. `In Review`: Awaiting review, testing, or approval.
  5. `Completed`: Successfully finished and closed.
- **Drag & Drop Experience**:
  - Native HTML5 Drag and Drop with visual drop targets and hover feedback.
  - Optimistic UI updates for snappy, immediate transitions.
  - Status changes automatically persisted in the database.
  - Each status move logs an entry in the task's status history audit trail.
  - Role-based validation ensures only authorized users (creator or assignee) can move tasks.
- **Alternative List View**: Tabular spreadsheet-like view with column sorting (Key, Summary, Status, Priority, Assignee, Due Date) and action buttons.

### 6. Project Dashboard
- **6 Overview Cards**:
  1. Total Tasks
  2. Idea Tasks
  3. To Do Tasks
  4. In Progress Tasks
  5. In Review Tasks
  6. Completed Tasks
- **Priority Distribution**: Visual progress breakdown of Critical, High, Medium, and Low tasks.
- **Workflow Progress Bar**: Segmented color bar showing ratio across all 5 stages.
- **Assigned to You**: Quick access list of issues waiting for your attention.
- **Recent Activity Stream**: Live feed showing recent status changes with timestamps and authors.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, TanStack React Query v5, Axios, Lucide React icons, React Hook Form, Zod.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Multer (file uploads), JWT, Bcrypt, Helmet, CORS, Express Rate Limit, Zod.
- **Containerization**: Docker, Docker Compose, Nginx (Alpine).

---

## 🚀 Running with Docker (Recommended)

To run the complete application (MongoDB + Backend + Frontend Nginx) in one command:

```bash
docker-compose up --build
```

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost/health

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js >= 18.0.0
- MongoDB instance (local or Atlas)

### 2. Backend Setup
```bash
cd server
npm install
npm run dev
```
Backend will start on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Frontend will start on `http://localhost:5173`.

---

## 🔒 Security Measures
- Passwords hashed with Bcrypt (salt rounds = 12).
- JWT tokens with short-lived access and secure refresh mechanisms.
- File upload restrictions: 25MB max size, file type filtering, sanitized storage paths.
- Helmet security headers with tuned Cross-Origin Resource Policy for uploaded assets.
- Rate limiting on API and authentication endpoints.
