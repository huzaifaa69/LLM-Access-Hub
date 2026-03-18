# LLM Access Hub 🤖
### Web Interface for Large Language Models

> Simplifying access to powerful AI models through a clean, streamlined interface.

🔗 **[Live Demo](https://tough-cobra-403.convex.app/)**

---

## Overview

LLM Access Hub is a full-stack web application that provides a streamlined interface for submitting prompts and receiving AI-generated responses. It serves as a solid foundation for building scalable AI-powered applications — chat systems, content generators, research assistants, and automation tools.

---

## Features

- Clean, responsive UI for interacting with large language models
- Real-time prompt submission and response generation
- Full-stack integration with Convex backend
- Authentication support via `@convex-dev/auth`
- Built with modern tooling: React 19, TypeScript, Tailwind CSS, Vite

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Convex (serverless) |
| AI Integration | OpenAI SDK |
| Build Tool | Vite |
| Notifications | Sonner |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Convex](https://convex.dev) account

### Local Setup

```bash
# Clone the repository
git clone https://github.com/your-username/llm-access-hub.git
cd llm-access-hub

# Install dependencies
npm install

# Start both frontend and backend in parallel
npm run dev
```

The app will open at `http://localhost:5173` and the Convex dev server will sync automatically.

### Environment Variables

Create a `.env.local` file in the root and add your keys:

```env
CONVEX_DEPLOYMENT=your-convex-deployment-url
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

---

## Project Structure

```
llm-access-hub/
├── src/                   # React frontend
│   ├── components/        # UI components (shadcn/ui)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities
│   └── main.tsx           # App entry point
├── convex/                # Convex backend functions
│   ├── auth.ts            # Authentication config
│   └── _generated/        # Auto-generated Convex types
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run frontend + Convex backend together |
| `npm run dev:frontend` | Frontend only (Vite) |
| `npm run dev:backend` | Convex backend only |
| `npm run build` | Production build |
| `npm run lint` | Type-check + lint + build |

---

## Deployment

This app is deployed on **Convex**. To deploy your own instance:

```bash
# Deploy backend
npx convex deploy

# Build and deploy frontend (or connect to Vercel/Netlify)
npm run build
```

---

