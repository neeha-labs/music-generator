# SonicForge AI

A full-stack AI music production suite. Generate structured lyrics with Gemini, compose music using MusicGen (Replicate), and perform vocal style transfers.

## 🚀 Deployment Guide

This project is designed to be deployed in two parts:
1. **Backend:** Python FastAPI on Render.com (Web Service)
2. **Frontend:** React on Vercel.com (Static Site)

### Prerequisites
*   A GitHub account (where this repo is pushed).
*   A [Replicate](https://replicate.com/) account + API Token.
*   A [Google AI Studio](https://aistudio.google.com/) account + API Key.

---

### Step 1: Deploy Backend (Render.com)

1.  Log in to [Render dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  **Configuration:**
    *   **Name:** `sonicforge-backend`
    *   **Runtime:** Python 3
    *   **Build Command:** `pip install -r backend/requirements.txt`
    *   **Start Command:** `python backend/main.py`
5.  **Environment Variables:**
    Scroll down to "Environment Variables" and add:
    *   `REPLICATE_API_TOKEN`: Your key starting with `r8_...`
    *   `PYTHON_VERSION`: `3.9.0` (Recommended)
6.  Click **Create Web Service**.
7.  Wait for the build to finish. Copy the **onrender.com URL** (e.g., `https://sonicforge-backend.onrender.com`).

---

### Step 2: Deploy Frontend (Vercel.com)

1.  Log in to [Vercel dashboard](https://vercel.com/).
2.  Click **Add New** -> **Project**.
3.  Import the same GitHub repository.
4.  **Framework Preset:** Create React App (or Vite, usually auto-detected).
5.  **Environment Variables:**
    Add the following variables:
    *   `REACT_APP_API_URL`: The Backend URL from Step 1 (e.g., `https://sonicforge-backend.onrender.com`) - *No trailing slash*.
    *   `API_KEY`: Your Google Gemini API Key.
6.  Click **Deploy**.

---

### Step 3: Local Development

1.  **Backend:**
    ```bash
    cd backend
    pip install -r requirements.txt
    python main.py
    ```
    Runs on `http://localhost:8000`

2.  **Frontend:**
    ```bash
    npm install
    npm start
    ```
    Runs on `http://localhost:3000`

### Troubleshooting

*   **Backend Waking Up:** Render's free tier spins down after inactivity. The first request might take 60s. The frontend has a built-in message to warn the user about this.
*   **CORS Error:** If you see CORS errors in the browser console, ensure the Vercel URL is whitelisted in `backend/main.py` or `"*"` is allowed.
