# DevBoard Client

The frontend application for **DevBoard**, a collaborative project management platform. Built with React and Vite, it provides an intuitive interface for users to manage workspaces, projects, and tasks while collaborating with team members in real time.

## Features

- User Authentication (Login & Registration)
- Dashboard Overview
- Workspace Management
- Project Management
- Task Creation & Editing
- Task Details View
- File Attachments
- Protected Routes
- Real-time Updates with Socket.IO
- Responsive User Interface

## Tech Stack

- React
- Vite
- React Router DOM
- Axios
- Socket.IO Client

## Project Structure

```
src/
├── api/              # Axios configuration
├── components/       # Reusable UI components
├── pages/            # Application pages
├── socket/           # Socket.IO client
├── styles/           # Stylesheets
├── App.jsx
└── main.jsx
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Backend

This client communicates with the DevBoard backend through REST APIs and Socket.IO for real-time collaboration.

## License

MIT
