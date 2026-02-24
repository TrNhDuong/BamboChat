# Deploying BamboChat to Azure 🚀

This guide documents the exact steps used to deploy the BamboChat backend to Azure using **Azure App Service for Containers**.

---

## 🏗️ Step 1: Create Azure Container Registry (ACR)

1.  **Create Registry**: Search for "Container registries" in Azure Portal and create one (e.g., named `BamboChat`).
2.  **Enable Admin User (CRITICAL)**:
    - Go to your ACR -> **Settings** -> **Access keys**.
    - Toggle **Admin user** to **Enabled**. This allows the Web App to pull images using simple credentials.

---

## 📦 Step 2: Push Image to Registry

### Option A: Build directly on Azure (Recommended)
In your project folder, run:
```powershell
az acr build --registry BamboChat --image bambochat-backend:v1 .
```

### Option B: Build locally and Push
1.  **Login**: `az acr login --name BamboChat`
2.  **Tag**: `docker tag bambochat-backend:latest bambochat.azurecr.io/bambochat-backend:v1`
3.  **Push**: `docker push bambochat.azurecr.io/bambochat-backend:v1`

---

## 🚀 Step 3: Create & Configure Web App

1.  **Create Web App**:
    - Publish: **Docker Container**.
    - Operating System: **Linux**.
2.  **Deployment Center**:
    - Source: **Azure Container Registry**.
    - Authentication: **Admin credentials**.
    - Registry: `BamboChat`.
    - Port: Đổi từ 80 thành **5000**.
3.  **Environment Variables (CRITICAL)**:
    - Go to **Settings** -> **Environment variables**.
    - Use **Advanced edit** to paste all variables from `.env` in JSON format.
    - **Required**: Add `"WEBSITES_PORT": "5000"`.

---

## ✅ Step 4: Verification
Access your health check endpoint:
`https://<your-app-name>.azurewebsites.net/api/health`

**Expected result:** `{"status":"OK", ...}`

---

## 🔄 Updating the Application

Khi bạn có thay đổi về code, hãy làm theo các bước sau để cập nhật lên Azure:

### 1. Build và Push bản mới
Bạn nên tăng version của tag (ví dụ từ `v1` lên `v2`) để dễ quản lý:
```powershell
az acr build --registry BamboChat --image bambochat-backend:v2 .
```

### 2. Cập nhật Web App
- Vào Azure Portal -> Web App -> **Deployment Center**.
- Đổi **Tag** từ `v1` sang `v2`.
- Nhấn **Save**. Azure sẽ tự động kéo bản mới về và restart.

---

## ⚡ Step 5: Automate with CI/CD (GitHub Actions)

Đây là cách "xịn" nhất: Cứ push code lên GitHub là Azure tự động cập nhật.

### 1. Truy cập Deployment Center
Vào Azure Portal -> Web App của bạn -> **Deployment Center**.

### 2. Thiết lập GitHub Action
- **Source**: Chọn **GitHub**.
- **Change Provider**: Nếu chưa login, hãy nhấn để Azure kết nối với tài khoản GitHub của bạn.
- **Organization/Repository/Branch**: Chọn đúng repo và branch (`main`) của bạn.
- **Authentication**: Chọn **User-assigned identity** (khuyên dùng) hoặc **Service Principal**.
- **Registry settings**: Chọn đúng ACR `BamboChat` của bạn.

### 3. Nhấn Save
- Sau khi nhấn **Save**, Azure sẽ tự động tạo một file `.github/workflows/main_xxx.yml` vào thẳng repo GitHub của bạn.
- **Cơ chế**:
    1.  Mỗi khi bạn `git push`, GitHub Actions sẽ khởi chạy.
    2.  Nó đọc `Dockerfile` trong repo để build image.
    3.  Nó đẩy (push) image đó lên Azure Container Registry (ACR).
    4.  Nó thông báo cho Web App biết là có bản mới để kéo về.

---

## 📝 Important Notes
*   **CORS**: Remember to update your CORS settings in `src/server.js` if your frontend is hosted on a different Azure URL.
*   **Database**: Ensure your MongoDB Atlas allows connections from Azure's IP addresses (or allow all IPs `0.0.0.0/0` temporarily).
*   **Logs**: You có thể xem live logs tại mục **Monitoring > Log stream** trong Azure Portal.
