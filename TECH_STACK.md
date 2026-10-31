# NutriTrack AI — Technology Stack & Dependencies Audit

This document details every technology, runtime, framework, library, model, and hosting platform actually used across the NutriTrack AI codebase. All entries are verified directly from `package.json`, `package-lock.json`, `requirements.txt`, and active environment audits.

---

## 1. Programming Languages

| Language | Version | Usage Scope |
|---|---|---|
| **TypeScript** | `5.7.0` (Compiler) / `5.8` | Entire frontend application (`nutritrack-app/src`), components, algorithmic engines, state stores, and Next.js server route handlers. |
| **JavaScript (ES Modules)** | ES2024 / Node.js 24.21.0 | Configuration files (`next.config.mjs`, `postcss.config.mjs`). |
| **Python** | `3.13.7` (64-bit Windows) | Standalone neural vision food scanner service (`nutritrack-scanner`), dataset prep, evaluation scripts, and PDF report generator. |

---

## 2. Frontend Frameworks & Libraries

| Technology | Exact Version | Role in Codebase |
|---|---|---|
| **Next.js** | `16.3.3` | Core web application framework utilizing the **App Router** (`src/app`), Server Components, Client Components (`'use client'`), and Turbopack bundler. |
| **React** | `19.2.8` | UI rendering engine, hooks (`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`), and component tree. |
| **React DOM** | `19.2.8` | Web DOM reconciliation and client rendering. |
| **Lucide React** | `^1.37.0` | Comprehensive iconography system across navigation, dashboard gauges, macro cards, and scanner controls. |
| **Canvas Confetti** | `^1.9.4` | Gamified celebration animations when confirming meals, logging routines, or hitting daily hydration milestones. |
| **clsx** | `^2.1.1` | Conditional class name construction utility. |
| **tailwind-merge** | `^3.0.2` | Conflict-free Tailwind CSS utility class merging. |

---

## 3. CSS, Styling & Design System

| Technology | Exact Version | Role in Codebase |
|---|---|---|
| **Tailwind CSS** | `4.3.3` | High-performance CSS framework using the modern `@import "tailwindcss";` v4 architecture. |
| **@tailwindcss/postcss** | `4.3.3` | PostCSS integration plugin for Tailwind v4 compilation. |
| **PostCSS** | `8.5.26` | CSS transformation engine. |
| **Design Tokens** | Custom Emerald / Slate | Primary Emerald (`#10B981` / `#00C27A`), Dark Emerald (`#059669`), Accent Teal (`#0D9488`), Soft Mint (`#F0FDF4`), Dark Stone (`#1C1917` / `#1E293B`), Background Canvas (`#FAFCFB`). Glassmorphic border and blur effects. |

---

## 4. Backend Frameworks & API Architecture

| Technology | Exact Version | Role in Codebase |
|---|---|---|
| **Next.js Route Handlers** | `16.3.3` | Server-side endpoints (`src/app/api/*`) executing on Node/Edge runtime for authentication, user sync, conversational assistant, and scanner proxy. |
| **FastAPI** | `0.141.1` | High-performance asynchronous Python REST API hosting the standalone food scanner service on port `8001`. |
| **Uvicorn** | `0.52.4` (Standard) | Lightning-fast ASGI production web server running the FastAPI scanner application. |
| **Starlette** | `1.6.0` | Underlying ASGI toolkit powering FastAPI request handling, CORS middleware, and HTTP exceptions. |
| **Pydantic** | `2.13.5` | Strict data validation, request parsing, and schema generation for scanner API inputs (`NutritionRequest`, `NutritionItem`). |
| **python-multipart** | `0.0.32` | Streaming multipart form-data parser for processing raw binary image uploads in `POST /predict`. |

---

## 5. Database & Data Persistence

| Technology | Version / Format | Architecture & Usage |
|---|---|---|
| **Local-First Browser Store** | Web Storage API | Primary reactive persistence layer (`src/lib/storage.ts`) storing active user account, profiles, meal logs, water logs, weight history, and calendar events. Dispatches window events (`nutritrack_meals_updated`, `nutritrack_profile_updated`) for multi-tab synchronization. |
| **Server-Side File Database** | JSON (`fs`/`path`) | Persistent file-based database (`nutritrack-backend.json`) located in `data/` (with automatic fallback to `/tmp` for serverless environments) managed by `src/lib/serverDatabase.ts`. |
| **Supabase PostgreSQL Client** | `@supabase/supabase-js` `^2.49.1` | Configured cloud PostgreSQL database integration (`src/lib/supabase.ts`) supporting remote schema syncing when credentials are provided. Operates seamlessly in resilient offline mode when unconfigured. |

---

## 6. Authentication System

| Feature | Implementation Mechanism |
|---|---|
| **Credential Authentication** | Server route handlers (`/api/auth/login`, `/api/auth/register`, `/api/auth/users`) validating email and password credentials against `nutritrack-backend.json`. |
| **Multi-Profile Switching** | Navigation bar dropdown (`UserSwitcher`) allowing immediate switching between pre-seeded demo personas (`Maya`, `Alex`) or custom registered user accounts. |
| **Session Isolation** | Account-scoped storage keys (`nutritrack_accounts_v2`, `nutritrack_active_user_id_v2`). Passwords are automatically sanitized and omitted before responses are returned to the client. |

---

## 7. AI & Machine Learning Models

| Model | Architecture & Version | Host / Integration | Task & Capabilities |
|---|---|---|---|
| **OpenCLIP Vision Model** | `ViT-B-32` (`laion2b_s34b_b79k` weights) | Local PyTorch in Python service (`nutritrack-scanner`) | Zero-shot multimodal image-text matching. Dual-model function: (1) **Gate Model** (food vs. non-food vs. nutrition label), (2) **Food Classifier** (43 reference classes). |
| **Groq LLM Coach** | `llama-3.3-70b-versatile` | Cloud inference via `groq-sdk` (`^0.15.0`) | Contextual nutrition assistant in `/api/assistant`. Prompt-engineered with strict clinical ethical rules against starvation, restriction, and eating guilt. |
| **MobileNetV3 / EfficientNet-B0** | PyTorch / ONNX Pipeline (in `training/`) | Standalone Python training pipeline | Supervised training, class-weighted loss, and ONNX export tools for offline edge deployment. |

---

## 8. External APIs & Cloud Services

| API Service | Purpose | Protocol / Endpoint |
|---|---|---|
| **Groq Cloud API** | Generates real-time conversational nutrition coaching responses. | HTTPS REST (`https://api.groq.com/openai/v1/chat/completions`) |
| **Supabase Cloud API** | Cloud relational database persistence and health check probing. | HTTPS REST / PostgREST (`https://<project-ref>.supabase.co`) |
| **Hugging Face Hub** | Automated downloading and caching of OpenCLIP model checkpoints (`open_clip_model.safetensors`). | HTTPS (`https://huggingface.co/laion/...`) |
| **USDA FoodData Central** | Optional tool script (`tools/import_usda_fdc.py`) for querying official government food nutrient tables via `api.data.gov`. | HTTPS REST (`https://api.nal.usda.gov/fdc/v1/...`) |

---

## 9. Image Processing & Computer Vision Libraries

| Library | Version | Usage Scope |
|---|---|---|
| **OpenCV Headless** | `5.0.0.93` (`opencv-python-headless`) | Server-side image quality filtering: blur detection via Laplacian variance ($D = \nabla^2 I$), brightness and darkness histogram inspection, edge extraction. |
| **Pillow (PIL)** | `12.3.0` | Image format validation (JPEG, PNG, WebP), EXIF orientation normalization, thumbnail downsampling, and bounding box crops. |
| **PyTorch & Torchvision** | `torch 2.15.0+cpu`, `torchvision 0.29.2` | Tensor preprocessing, normalization vectors, tensor transformations (`Resize`, `CenterCrop`, `ToTensor`, `Normalize`), and forward-pass inference. |
| **HTML5 Canvas** | Browser Native | Client-side image snapshotting, video stream frame capture, and base64 data URL conversion. |

---

## 10. Deployment, Tooling & Testing

| Tool | Version | Role in Codebase |
|---|---|---|
| **Vercel** | Edge Network / Serverless | Production hosting for Next.js web application (`https://nutritrack-app-beryl-five.vercel.app`). Configured via `vercel.json`. |
| **Pytest** | `9.2.0` | Automated test runner for the Python scanner service. All 36 pipeline, API, units, and metrics tests pass. |
| **HTTPX** | `0.28.1` | Asynchronous HTTP test client for FastAPI end-to-end endpoint verification. |
| **ReportLab** | `5.0.1` | Programmatic PDF generation engine used to generate the system context documents and UI reference manuals. |
| **Node.js** | `v24.21.0` (LTS) | Local JavaScript/TypeScript execution runtime. |
