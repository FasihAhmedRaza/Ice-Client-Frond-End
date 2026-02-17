# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend
```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Production build
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

### Backend (`Ice-Backend-Updated/`)
```bash
pip install -r requirements.txt
python app.py             # Dev server on port 5000
# Production: gunicorn app:app --workers=1 --threads=4 --timeout=180
```

No test suite is configured for either project.

## Architecture Overview

This is a full-stack AI-powered ice sculpture design platform ("Cynx AI" / "Ice Butcher Works").

**Frontend**: React 19 + Vite 7, JavaScript/JSX, TailwindCSS 4, Supabase auth, Axios, React Router v7. Deployed on Vercel.

**Backend**: `Ice-Backend-Updated/app.py` — a single-file Flask app (~69KB). Deployed on Railway (`https://web-production-f43cf.up.railway.app/`).

---

## Frontend

**Entry flow**: `main.jsx` → `App.jsx` (BrowserRouter) → `Home.jsx` → `ChatInterface.jsx` (~1750 lines, the core UI).

**Single-page app**: Only one real route (`/`). Vercel rewrites all paths to `index.html`. `/app` redirects to `/`.

**API connection**: `src/api.js` (Axios instance, base URL from `src/config.js`). Vite proxy (`vite.config.js`) forwards `/api`, `/static/generated`, and `/static/uploads` to the Railway backend in dev.

**Auth**: `src/context/AuthContext.jsx` wraps the app and exposes `useAuth()`. Supabase handles sessions (`signIn`, `signUp`, `signOut`). `src/components/ProtectedRoute.jsx` redirects unauthenticated users. Frontend `.env` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

**Key components**:
- `ChatInterface.jsx` — multi-mode wizard (text-to-image, image-to-image, custom-build, video, edit), file upload, modals. Read carefully before touching.
- `Sidebar.jsx` — template browser; data comes from `src/assets/sidebar_images.json`.
- `IceChatWidget.jsx` — support chatbot calling `POST /api/chatbot`.
- `GuidedTour.jsx` — onboarding overlay.

**State**: All wizard/modal/generation state is local `useState` in `ChatInterface.jsx`. Only auth is shared globally via context. No Redux or Zustand.

**Styling**: TailwindCSS utilities + `src/index.css` (~96KB global styles). ESLint uses the flat config format (`eslint.config.js`).

---

## Backend (`Ice-Backend-Updated/`)

All logic lives in a single file: `app.py`.

### External Services

| Service | Purpose | Env Var(s) |
|---|---|---|
| **Google Gemini** (`gemini-2.0-flash-preview-image-generation`) | Ice sculpture image generation, logo extraction, image expansion | `GEMINI_API_KEY` |
| **OpenAI GPT-4o** | Intent classification, text-only chat responses | `OPENAI_API_KEY` |
| **Cloudinary** | CDN storage for all generated/uploaded images and videos | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| **Supabase** | `generated_images` table (metadata, history, favourites), JWT auth verification | `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Kling AI** | Async image-to-video generation | `KLING_ACCESS_KEY`, `KLING_SECRET_KEY` |

### API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/chatbot` | **Main generation endpoint** — handles all image generation modes |
| POST | `/api/expand_chatbot` | Expand/enhance an existing image |
| POST | `/api/extract_logo` | Extract a logo from an uploaded image |
| POST | `/api/template_selected` | Register template selection in Flask session |
| GET | `/api/get_user_history` | User's generation history (auth required) |
| GET | `/api/get_user_favourites` | User's favourited images (auth required) |
| GET | `/api/get_showcase_favourites` | Public showcase of top favourited images |
| POST | `/api/toggle_favourite` | Toggle favourite status on an image |
| POST | `/api/delete_history_item` | Delete an image from history |
| POST | `/api/create_video` | Start async video generation via Kling AI |
| GET | `/api/get_video_status/<task_id>` | Poll Kling AI for video completion |
| POST | `/api/submit_feedback` | Submit feedback (goes to Google Sheets webhook) |
| POST | `/api/log_button_press` | Analytics: log expand button clicks |
| POST | `/api/admin/get_history` | Admin: all generated images paginated |
| POST | `/api/admin/get_users` | Admin: all users with image counts (email whitelist gated) |

### Image Generation Flow (`POST /api/chatbot`)

1. **Ice cube mode** (`ice_cube_type` param set): Embeds user logo into a predefined ice cube style (Snofilled / Colored / Paper / Snofilled+paper) via Gemini.
2. **Sculpture mode** (images uploaded or sculpture name detected in text): Auto-detects sculpture type using fuzzy string matching (`rapidfuzz`) against 40+ templates stored in `static/`. Combines user images with template reference images, then sends a detailed JSON instruction prompt to Gemini enforcing transparency, front-angle camera, proportions, etc.
3. **Text chat** (text only, no images, no sculpture): Intent classified by GPT-4o — routes to either a Gemini text-to-image call or a GPT-4o text response.

After generation: image is saved to Cloudinary, metadata stored in Supabase `generated_images` table, conversation saved to Flask session (last 5 messages).

### Static Templates

`static/bases/`, `static/sculptures/`, `static/wedding_Showpieces/`, `static/Toppers/`, `static/Ice bars/` — reference images used as inputs to Gemini. The `SCULPTURE_BASES` dict in `app.py` maps sculpture names (with fuzzy aliases) to their file paths.

### Supabase Schema (relevant table)

`generated_images`: `id`, `url` (Cloudinary URL), `prompt`, `template_type`, `user_id`, `is_favourite`, `created_at`.

### Backend `.env` Keys

```
GEMINI_API_KEY, OPENAI_API_KEY,
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET,
SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_ROLE_KEY,
KLING_ACCESS_KEY, KLING_SECRET_KEY,
MAX_SOURCE_SIDE (default 2048), WORKING_THUMB_SIDE (default 1024),
JPEG_QUALITY (default 80), MAX_UPLOAD_BYTES (default 5MB),
OUTPUT_IMAGE_FORMAT (jpeg), FLASK_SECRET_KEY, PORT (default 5000)
```
