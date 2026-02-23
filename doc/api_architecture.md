# API Architecture & Software Design: BamboChat System

This document defines the overall architecture, directory structure, and the list of RESTful APIs and WebSocket events for the BamboChat project. The system follows the **Controller - Service - Repository** layered model to ensure modularity and maintainability.

---

## 1. Architectural Model

The system is divided into 4 core layers:

1.  **Routing / Gateway:** Uses `express.Router` to define endpoints and applies `authMiddleware` (JWT) to protect private resources.
2.  **Controller Layer:** Handles HTTP Request/Response, performs basic input validation, and delegates work to the Service Layer.
3.  **Service Layer (Business Logic):** Contains complex business logic (e.g., handling friend requests, validating chat room existence, processing avatar uploads).
4.  **Repository Layer:** Interacts directly with MongoDB via Mongoose Models for data persistence and retrieval.

---

## 2. RESTful API Reference

All APIs (except Authentication) require the Header: `Authorization: Bearer <token>`.

### A. Authentication - `/api/auth`

| Method | Endpoint | Purpose | Notes |
| :--- | :--- | :--- | :--- |
| POST | `/register` | User registration | Triggers OTP email verification. |
| POST | `/verify-otp` | Verify email OTP | Requires 6-digit OTP and email. |
| POST | `/login` | Basic authentication | Returns Access Token & Refresh Token. |
| GET | `/google` | Google OAuth Login | Redirects to Google login page. |
| GET | `/google/callback`| OAuth callback | Returns tokens via URL parameters. |

### B. Users - `/api/users`

| Method | Endpoint | Purpose | Notes |
| :--- | :--- | :--- | :--- |
| GET | `/search` | Search users | By `id` (query param). |
| PUT | `/profile` | Update profile | Change `displayName` and `bio`. |
| POST | `/avatar` | Upload avatar | Multer-based image upload to Cloudinary. |

### C. Friends - `/api/friends`

| Method | Endpoint | Purpose | Notes |
| :--- | :--- | :--- | :--- |
| GET | `/` | List friends | Returns an array of friend user IDs. |
| GET | `/requests/pending`| Received requests | Friend requests awaiting your action. |
| GET | `/requests/sent` | Sent requests | Friend requests you have sent out. |
| POST | `/requests` | Send friend request | Requires `addresseeId`. |
| PUT | `/requests/:id` | Accept/Reject | `action: 'accept' / 'reject'`. |
| DELETE | `/:id` | Unfriend | Removes the friendship bond. |

### D. Conversations - `/api/conversations`

| Method | Endpoint | Purpose | Notes |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create/Get chat | Used for both 1-on-1 and Group chats. |
| GET | `/` | List conversations | Rooms with the latest message snippet. |
| GET | `/:id/messages` | Get history | Supports cursor-based pagination. |
| POST | `/:id/participants` | Add members | Add multiple users to a group. |
| DELETE | `/:id/participants/:userId` | Kick participant | Admin-only member removal. |

---

## 3. WebSocket Events (Socket.io)

### Client Emit (Input)
*   **`send_message`**: `{ conversationId, content }`
*   **`join_conversation`**: `{ conversationId }`
*   **`typing`**: `{ conversationId, isTyping }`

### Client Listen (Output)
*   **`receive_message`**: `{ _id, conversationId, senderId, content, createdAt }`
*   **`user_online_status`**: Real-time status updates for friends.
*   **`friend_request`**: Notification for new incoming requests.

---

## 4. Middleware & Error Handling
*   **`authMiddleware`**: Validates the JWT in the Header. Returns 401 if invalid/expired.
*   **`errorHandler`**: Centralized middleware that catches all errors and returns a standardized JSON object `{ message, status }`.
