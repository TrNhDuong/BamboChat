# Setup & Running the Project (Setup Guide)

This guide will help you set up the environment and run the BamboChat project on your local machine.

---

## 1. Prerequisites

*   **Node.js**: Version 16.x or higher.
*   **MongoDB**: A MongoDB Atlas Cluster or a local MongoDB instance.
*   **npm**: Usually bundled with Node.js.
*   **Cloudinary Account**: Required for avatar/image storage.

---

## 2. Backend Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables (.env)**:
    Create a `.env` file in the `backend/` root with the following variables:
    ```env
    PORT=5000
    MONGODB_URI="your_mongodb_connection_string"
    JWT_SECRET="your_secure_random_string"
    JWT_REFRESH_SECRET="your_another_secure_string"
    JWT_EXPIRES_IN=15m
    JWT_REFRESH_EXPIRES_IN=7d

    # Email Service (Brevo) for OTP
    BREVO_API_KEY="your_brevo_api_key"
    BREVO_URL="https://api.brevo.com/v3/smtp/email"

    # Google OAuth (for Google Login)
    GOOGLE_CLIENT_ID="your_google_client_id"
    GOOGLE_CLIENT_SECRET="your_google_client_secret"

    # Cloudinary (for avatar uploads)
    CLOUDINARY_NAME="your_cloud_name"
    CLOUDINARY_API_KEY="your_api_key"
    CLOUDINARY_API_SECRET="your_api_secret"
    ```
4.  **Run the Backend**:
    *   Development mode (Auto-reload): `npm run dev`
    *   Production mode: `npm start`

---

## 3. Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configuration**:
    The Frontend connects to `http://localhost:5000/api` by default. If your backend uses a different port, update the URLs in `src/services/api.ts` and `src/services/socket.ts`.
4.  **Run the Frontend**:
    ```bash
    npm run dev
    ```
    The application will be available at: `http://localhost:5173`

---

## 4. Important Notes

*   **Google OAuth**: When creating credentials in the Google Cloud Console, ensure you add `http://localhost:5000/api/auth/google/callback` to the **Authorized redirect URIs** list.
*   **Cloudinary Presets**: Ensure your Cloudinary account is active and the API keys are correctly entered in the `.env` file.
*   **Database Access**: Ensure your MongoDB Atlas Network Access whitelist includes your current IP address.
