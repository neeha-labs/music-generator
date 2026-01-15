# SonicForge AI - System Architecture

## Overview
SonicForge AI is a hybrid architecture application. It leverages Client-Side AI (Gemini) for low-latency text generation and Server-Side AI (Python/FastAPI + Replicate) for heavy media processing.

## Diagram

```mermaid
graph TD
    User[User Browser]
    
    subgraph Frontend [React SPA]
        UI[Dashboard UI]
        GS[Gemini Service]
        AS[API Service]
    end
    
    subgraph GoogleCloud [Google Cloud]
        Gemini[Gemini 1.5 Flash API]
    end
    
    subgraph Backend [Python FastAPI Server]
        API[FastAPI Router]
        Orch[Orchestrator Logic]
    end
    
    subgraph ExternalAI [External AI Providers]
        Suno[MusicGen / Suno API]
        RVC[Replicate (RVC Model)]
    end

    User --> UI
    UI --> GS
    GS -->|Generate Lyrics| Gemini
    
    UI --> AS
    AS -->|POST /generate-music| API
    AS -->|POST /convert-vocals| API
    
    API --> Orch
    Orch -->|Job Request| Suno
    Orch -->|Job Request| RVC
    
    Suno -->|Audio URL| Orch
    RVC -->|Audio URL| Orch
    
    Orch -->|JSON Response| API
    API -->|JSON Response| AS
```

## Data Flow

1.  **Lyrics Generation (Client-Side Optimized)**
    *   **Input:** User provides a use-case string.
    *   **Process:** Frontend calls `ai.models.generateContent` directly using `@google/genai`.
    *   **Reasoning:** Reduces latency, utilizes the user's/app's API key directly, and offloads text processing from the backend.

2.  **Music Composition (Server-Side)**
    *   **Input:** Structured lyrics and genre.
    *   **Process:** Frontend sends payload to FastAPI backend. Backend authenticates and dispatches a job to a music generation model (e.g., via Replicate or Suno wrapper).
    *   **Reasoning:** Hides sensitive vendor API keys (Replicate/Suno), manages long-running jobs, and handles webhooks.

3.  **Vocal Conversion (Server-Side)**
    *   **Input:** Audio file (Multipart/Form-Data).
    *   **Process:** Backend receives file, uploads to temporary storage (S3/GCS), and calls RVC model API.
    *   **Reasoning:** Heavy file handling and secure coordination with GPU providers.

## Required Environment Variables

### Frontend (.env)
*   `API_KEY`: Google Gemini API Key.

### Backend (.env)
*   `REPLICATE_API_TOKEN`: For MusicGen/RVC.
*   `OPENAI_API_KEY`: (Optional) If using OpenAI for fallback text logic.
*   `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`: For S3 bucket (storage of generated assets).
