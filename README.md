# BamboChat - Real-time Messaging Backend

BamboChat is a high-performance backend API and WebSocket server for real-time messaging, featuring robust authentication and friend management.

---

## Core Features

*   **Real-time Messaging**: Bi-directional communication powered by **Socket.io**.
*   **Multi-mode Auth**: Secure login via **Email OTP (Brevo)** or **Google OAuth2**.
*   **Media Support**: Avatar management and image storage via **Cloudinary**.
*   **Friendship System**: Search, request, and manage contacts.
*   **Group Conversations**: Support for persistent chat rooms with roles (Admin/Member).
*   **Scalable Architecture**: Layered design (Controllers-Services-Repositories) for maintainability.

---

## Tech Stack

*   **Node.js & Express**: API framework.
*   **MongoDB & Mongoose**: Data persistence.
*   **Passport.js**: Authentication engine.
*   **Socket.io**: Real-time layer.
*   **Cloudinary & Multer**: Media processing.
*   **Brevo SDK**: SMTP utility.

---

## Directory Structure

```text
.
├── src/
│   ├── config/         # App, Database, and Passport configurations
│   ├── controllers/    # API request handlers
│   ├── middlewares/    # Custom filters (Auth, Error)
│   ├── models/         # Mongoose Schemas
│   ├── repositories/   # Data access layer
│   ├── routes/         # Endpoint definitions
│   ├── services/       # Business logic
│   ├── sockets/        # Real-time event logic
│   ├── utils/          # Utilities (Mailer, Cloudinary)
│   └── server.js       # Application entry point
├── doc/                # Technical documentation
└── .env                # Environment variables
```

---

## Detailed Documentation

For deeper technical insights, please refer to the documents in the `doc/` directory:

1.  [**Setup Guide**](doc/setup_guide.md): How to get the project running on your local machine.
2.  [**API Architecture**](doc/api_architecture.md): List of endpoints and the layered architectural model.
3.  [**Database Design**](doc/database_design.md): Schema structures and data relationships.
4.  [**Authentication Flow**](doc/authentication.md): Details on JWT, OTP, and Google Login.
5.  [**WebSocket Flow**](doc/websocket_flow.md): How real-time messaging and status updates work.

---

## License

This project is developed for educational and personal use.
