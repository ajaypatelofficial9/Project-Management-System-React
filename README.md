# Project Management System - Frontend

A modern React dashboard for the Project Management System. Built with React 19, Redux Toolkit, React Router v7, and a custom design system.

## Features

- **Authentication** — Login / Signup with JWT
- **Role-based UI** — Admin and User dashboards
- **Projects** — Create, browse, manage projects with user assignment
- **Tasks** — Create tasks, enforce status flow (pending → in_progress → completed)
- **Comments** — Add/delete comments on tasks
- **Modern Design** — Custom CSS design system with responsive layout, cards, badges, modals, toasts

## Tech Stack

- React 19 + Vite
- Redux Toolkit + redux-persist (encrypted)
- React Router DOM v7
- Formik + Yup validation
- React Toastify
- Bootstrap (layout utilities)
- Custom CSS design system

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file (or `.env.local`):

```env
VITE_API_URL=http://localhost:3001
```

### 3. Start Development Server

```bash
npm run dev
```

App runs at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Usage

### Admin Account

Use the backend seeder to create your admin:

```bash
cd ../userLoginBackend
npm run seed:admin
```

Default: `admin@projectms.com` / `Admin@1234`

### Regular Users

Register via the `/signup` page. All new signups get `role: user` automatically.

## Pages

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Guest only | Login page |
| `/signup` | Guest only | Registration page |
| `/dashboard` | Authenticated | Overview stats + recent items |
| `/projects` | Authenticated | Project list (admin: all; user: assigned) |
| `/projects/:id` | Authenticated | Project detail + tasks + admin management |
| `/tasks` | Admin only | All tasks table with status filter |
| `/tasks/:id` | Authenticated | Task detail + status update + comments |
| `/profile` | Authenticated | User profile management |

## State Management

Redux store structure:

```
store/
├── auth     — persisted (encrypted)
│   └── userAuthdata  { token, id, email, firstName, lastName, role, ... }
├── project  — not persisted (re-fetched)
│   └── projects[], currentProject, users[], loading, error
├── task     — not persisted
│   └── tasks[], currentTask, loading, error
└── comment  — not persisted
    └── comments[], loading, error
```

## Project Structure

```
src/
├── apiEndPoints/           # API endpoint constants
│   └── common/
│       ├── Auth/
│       ├── Projects/
│       ├── Tasks/
│       └── Comments/
├── components/
│   ├── common/             # Reusable: AppLayout, Navbar, Sidebar, Badge, Modal, Spinner, EmptyState
│   ├── Login/              # Login page + validation
│   ├── Signup/             # Signup page + validation
│   ├── Dashboard/          # Profile page + Dashboard overview
│   ├── Projects/           # ProjectsPage + ProjectDetailPage
│   └── Tasks/              # TasksPage + TaskDetailPage
├── constants/
│   └── routes.js           # Route path constants + helpers
├── HOCs/
│   └── AuthHOCs.jsx        # withAuth, withGuest, withAdmin
├── redux/
│   ├── AuthSlice/
│   ├── ProjectSlice/
│   ├── TaskSlice/
│   └── CommentSlice/
├── services/
│   ├── api.js              # Shared fetch wrapper (auto Bearer token)
│   ├── auth.service.js     # Login, Signup, Profile, Upload
│   ├── project.service.js
│   ├── task.service.js
│   └── comment.service.js
└── store/
    └── index.js            # Redux store + persist config
```

## Design System

All styles are in `src/index.css` using CSS custom properties:

- `--primary`, `--success`, `--warning`, `--danger` — semantic colours
- `--bg`, `--surface`, `--border` — layout colours
- Utility classes: `.btn`, `.btn-primary`, `.form-control`, `.badge`, `.card`, `.data-table`, `.modal`, etc.

## License

MIT
