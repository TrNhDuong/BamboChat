# BamboChat - Real-time Messaging System

BamboChat is a modern messaging application that supports real-time communication, friend management, and a flexible login system.

---

## Key Features

*   **Real-time Chat**: Instantly send and receive messages using WebSockets (Socket.io).
*   **Multi-mode Authentication**: Login via traditional accounts (Email OTP verification) or Google OAuth2.
*   **User Avatars**: Personalized profile pictures powered by Cloudinary integration.
*   **Friend Management**: Search for users, send friend requests, and manage your contact list.
*   **Conversation Types**: Supports both 1-on-1 direct messages and multi-user **Group Chats**.
*   **Group Management**: Create rooms, manage participants, and admin-only "kick" functionality.
*   **Modern UI/UX**: Premium "floating card" design with rounded corners, fluid animations, and Dark Mode support.
*   **Message Search**: Quickly find past messages within any conversation via the Detail Pane.

---

## Tech Stack

### Backend
*   **Node.js & Express**: Core API server.
*   **MongoDB & Mongoose**: NoSQL database and object modeling.
*   **Passport.js**: Authentication middleware for Google OAuth2.
*   **Socket.io**: Bi-directional real-time communication.
*   **Cloudinary & Multer**: Cloud image storage and upload processing.
*   **Brevo SDK**: SMTP service for sending OTP emails.

### Frontend
*   **React (Vite)**: Modern frontend library and build tool.
*   **TypeScript**: Static type checking for robust code.
*   **Socket.io Client**: WebSocket integration.
*   **Vanilla CSS**: Custom Design System with a premium aesthetic.

---

## Directory Structure

The project is organized as a monorepo with two main components:

```text
.
├── backend/                # Server source code (Node.js/Express)
│   ├── src/
│   │   ├── config/         # DB, Passport, and App configurations
│   │   ├── controllers/    # Route handler logic
│   │   ├── middlewares/    # Custom filters (Auth, Error handling)
│   │   ├── models/         # Mongoose Schema definitions
│   │   ├── repositories/   # Data access layer (Direct DB queries)
│   │   ├── routes/         # API endpoint definitions
│   │   ├── services/       # Business logic layer
│   │   ├── sockets/        # Real-time event handling (Socket.io)
│   │   ├── utils/          # Utility functions (Mailer, Cloudinary...)
│   │   └── server.js       # Backend entry point
│   └── .env                # Backend environment variables
├── frontend/               # Client source code (React/Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Global state management (AuthContext)
│   │   ├── pages/          # Main application views (Login, Chat...)
│   │   ├── services/       # API calling and Socket management
│   │   └── App.tsx         # Main routing and entry component
│   └── index.html          # Root HTML file
├── doc/                    # Technical documentation directory
└── README.md               # Project overview and documentation
```

---

## Detailed Documentation

For deeper technical insights, please refer to the documents in the `doc/` directory:

1.  [**Setup Guide**](doc/setup_guide.md): How to get the project running on your local machine.
2.  [**API Architecture**](doc/api_architecture.md): List of endpoints and the layered architectural model.
3.  [**Database Design**](doc/database_design.md): Schema structures and data relationships.
4.  [**Authentication Flow**](doc/authentication.md): Details on JWT, OTP, and Google Login.
5.  [**WebSocket Flow**](doc/websocket_flow.md): How real-time messaging and status updates work.
6.  [**UI Design System**](doc/ui_design.md): Design principles, colors, and layout aesthetics.

---

## License

This project is developed for educational and personal use.
