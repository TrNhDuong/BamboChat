# Authentication Flow (JWT & OAuth2)

BamboChat supports two primary authentication methods: Traditional Credentials (ID/Password + OTP) and Third-party Authentication (Google OAuth2).

---

## 1. Traditional Authentication (ID/Password)

The system uses a step-by-step verification process to ensure account security:

1.  **Registration**:
    *   User provides ID, Email, and Password.
    *   The Backend persists the User with `isVerified = false`.
    *   A 6-digit OTP is generated and sent via Email using the Brevo SMTP service.
2.  **OTP Verification**:
    *   The User inputs the OTP received.
    *   The Backend validates the code and updates the user status to `isVerified = true`.
3.  **Login**:
    *   User logs in with ID and Password.
    *   The system issues an **Access Token** (short-term) and a **Refresh Token** (long-term).
    *   The Access Token must be included in the `Authorization: Bearer <token>` header for all authenticated requests.

---

## 2. Google OAuth2

Integrated using the `passport-google-oauth20` library:

*   **Initialization**: The Frontend triggers `GET /api/auth/google`.
*   **Redirection**: The Backend redirects the user to the official Google login page.
*   **Callback**: Upon successful login, Google redirects back to `/api/auth/google/callback`.
*   **Backend Logic**:
    *   **Existing User**: If the email or Google ID matches, the user is logged in immediately.
    *   **New User**: A new account is automatically provisioned with default settings.
*   **Result Delivery**: The Backend redirects the user back to the Frontend with tokens embedded in the URL parameters. The Frontend parses these, persists them in `localStorage`, and navigates to the Chat interface.

---

## 3. Token Security & Management

*   **Access Token**: Expires after 15 minutes. Best stored in memory or short-term `localStorage`.
*   **Refresh Token**: Expires after 7 days. Used to obtain a new Access Token without requiring the user to re-authenticate manually.
*   **Socket Authentication**: During the WebSocket handshake, the Access Token is passed in the `auth` object of the Socket.io client to verify identity before allowing real-time communication.
