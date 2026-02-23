# Setup & Running the Project (Setup Guide)

This guide will help you set up the environment and run the BamboChat server on your local machine.

---

## 1. Prerequisites

*   **Node.js**: Version 18.x or higher (Node 22 LTS recommended).
*   **MongoDB**: A MongoDB Atlas Cluster or a local MongoDB instance.
*   **Cloudinary Account**: Required for media storage.

---

## 2. Server Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables (.env)**:
    Create a `.env` file in the root directory with the following variables:
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
3.  **Run the Server**:
    *   Development mode (Auto-reload): `npm run dev`
    *   Production mode: `npm start`

---

## 3. Important Notes

*   **Google OAuth**: Ensure you add `http://localhost:5000/api/auth/google/callback` to the **Authorized redirect URIs** in your Google Cloud Console.
*   **Cloudinary**: Verify that the API keys in your `.env` are correct for successful avatar uploads.
*   **Database**: Whitelist your IP address in MongoDB Atlas if using a cloud cluster.
