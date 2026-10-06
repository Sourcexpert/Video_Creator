# Fable — AI Story Studio

A polished, responsive product prototype for a character-consistent AI storytelling studio. Fable combines a short-form story workflow, a persistent character vault, a document-to-series planner and a scene editor in one workspace.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local Vite URL. To create a production bundle:

```bash
npm run build
npm run preview
```

Other scripts:

- `npm run lint` — check the code with ESLint.
- `npm run format` — format the code with Prettier.

## Project structure

```
src/
  main.jsx              Entry point
  App.jsx               App state, navigation and all data-changing actions
  data.js               Sample characters, projects and book chapters
  constants.js          Visual styles and the default Story studio draft
  styles.css            All styles
  components/           Shared UI: Sidebar, Topbar, Modal, AvatarArt, ProjectCover, badges
  pages/                One file per screen: Overview, Projects, Characters, Book, Studio, Editor
  modals/               Character, Cast, Engine, Export and Notifications dialogs
  hooks/                useStoredState (localStorage) and useClickOutside (menus)
  lib/projects.js       Helpers for ids, episodes, progress, status and time labels
  lib/documents.js      PDF/DOCX/TXT/Markdown text extraction and chapter/name detection
samples/kjv.pdf         A large public-domain PDF for testing Book to Series (not bundled)
```

## What works in this build

- **Overview:** idea prompt (Ctrl/⌘ + Enter to send), style picker, recent projects and a continue-editing card that follows your most recently edited project. Ctrl/⌘ + K opens search anywhere.
- **Story Studio:** choose cinematic, 3D, 2D or anime; set format, duration, language and a stock voice profile; select saved characters; draft and edit a storyboard.
- **Character Vault:** create, edit and delete character profiles with presentation, age, ethnicity/origin, skin tone, hair, signature clothing, visual style, language/accent and voice profile. Profiles are saved in browser `localStorage`.
- **Book to Series:** drag-and-drop or browse for PDF, DOCX, TXT or Markdown. PDF/DOCX/TXT/MD text extraction runs in the browser. The first-pass section and recurring-name suggestions are heuristic and editable. Select source sections, choose faithful or creative adaptation, set a visual style, pick saved cast and create an editable episode/scene outline. Long books are read page by page with progress, and the first 12 sections are pre-selected.
- **Scene Editor:** rename the project and episodes; add episodes; add, duplicate and delete scenes; edit titles, descriptions, camera framing and duration; mark scenes as approved (this drives project progress and status); choose the project cast; play a timed storyboard preview; save export settings; delete the project.
- **Safety-minded UX:** rights confirmation before source ingestion, consent confirmation for real-person likenesses, explicit public-figure impersonation restriction, source-grounded mode and clear separation of preview plans from rendered media.
- **Responsive UI:** desktop, tablet and mobile layouts, with mobile navigation.

The generated project art is a local image asset. User-created projects, characters and settings persist in the current browser only.

## Important prototype boundary

This build is a working frontend prototype, **not a connected video-generation service**. It does not call Runway, Veo, a voice-cloning service, a hosted LLM or FFmpeg, and it does not create or pretend to create an MP4. Storyboards use an editable local first-pass template; book headings and name candidates are extracted locally. The Video Engines and Export screens explain the integration points. Keep all provider credentials on a trusted server; never add secret keys to `VITE_*` variables or browser storage.

## Suggested production architecture

- **Web app:** React + Vite in this prototype; Next.js can be adopted if server-rendered product pages or a unified server layer are required.
- **API/orchestrator:** FastAPI (Python) or NestJS (Node) with authenticated, versioned endpoints for projects, character profiles, source documents, storyboard jobs and render jobs.
- **Persistence:** PostgreSQL for projects, character versions, consent records, source provenance and job state; object storage (S3-compatible or Azure Blob) for uploads, approved references and renders.
- **Async work:** Redis-backed queue (Celery/RQ or BullMQ) with separate ingestion, moderation, video-generation, speech and FFmpeg render workers. Use idempotent jobs, retries, timeouts and provider webhooks.
- **Provider adapters:** server-side interfaces for Runway/Veo and licensed TTS providers. Persist provider task IDs and normalized job status; keep a human review/approval checkpoint before generation and export.
- **Media:** FFmpeg in an isolated worker for assembly, subtitles, audio mix and output validation. Use signed URLs and automatic source-file retention/deletion policies.
- **Trust & safety:** rights attestation tied to source edition, consent records for real-person likeness/voice, moderation, abuse reporting, audit events and provenance/watermarking where available.

A minimal API boundary for the production implementation is: `POST /api/projects`, `POST /api/books/analyze`, `POST /api/storyboards`, `POST /api/renders`, `GET /api/jobs/:id`, plus CRUD routes for `/api/characters`. Add authentication, rate limits, quotas and tenant isolation before exposing these endpoints publicly.

## Notes

- Uploaded files are currently parsed in the browser and are not sent to a backend.
- Scanned/image-only PDFs need OCR before their text can be planned.
- Extracted names are suggestions, not verified character identities; users should review them.
- For copyrighted works, a public-domain source and a modern edition/translation may have different rights. Confirm rights for the exact edition uploaded.
