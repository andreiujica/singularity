<img width="1710" alt="Screenshot 2025-03-31 at 21 41 16" src="https://github.com/user-attachments/assets/55649e89-f732-4148-8bb7-a3171cf3e532" />

# Singularity

Singularity is a modern AI chat platform featuring a responsive Next.js frontend and a robust FastAPI backend.

[Watch the Demo Video](https://www.youtube.com/watch?v=uyTWpYqRdBI)

## Project Overview

Singularity provides an intuitive interface for conversational AI interactions with these key features:

- 💬 Real-time chat with AI
- 🌓 Light and dark mode support
- 📱 Responsive design for all devices
- 📝 Markdown rendering for rich text
- 🔄 WebSocket for instant communication
- 🧠 Support for both thinking and regular models


## Project Structure

This is a monorepo containing both frontend and backend applications:

```
singularity/
├── apps/                # Applications
│   ├── api/             # FastAPI backend
│   └── web/             # Next.js frontend
└── packages/            # Shared packages
    ├── ui/              # UI component library
    ├── eslint-config/   # Shared ESLint configuration
    └── typescript-config/ # Shared TypeScript configuration
```

### Applications

- **Web (Frontend)**: A Next.js application with React 19, providing the user interface
  - [Frontend Documentation](apps/web/README.md)

- **API (Backend)**: A FastAPI application serving as the backend
  - [Backend Documentation](apps/api/README.md)

## Getting Started

### Prerequisites

- Node.js (latest LTS)
- Python 3.9+
- Docker and Docker Compose
- pnpm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/andreiujica/singularity.git
   cd singularity
   ```

2. **Install dependencies (no need to run `install` scripts)**
   ```bash
   pnpm install --ignore-scripts
   ```

3. **Set up environment variables**
   ```bash
   cp apps/web/.env.example apps/web/.env
   cp apps/api/.env.example apps/api/.env
   ```

### Running the Applications

#### Quickstart (All Applications)
The easiest way to start all applications is with a single command:
```bash
pnpm dev:all
```

This will start both the frontend and backend applications simultaneously.

#### Individual Applications
For more granular control, you can use Turbo to run specific applications:

**Frontend Only**
```bash
pnpm dev:web
```

**Backend Only**
```bash
pnpm dev:api
```

Or navigate to each application directory and use their specific commands:

**Backend**
```bash
cd apps/api
make build
make start
```
Inside the Docker container:
```bash
make deps
make app
```

**Frontend**
```bash
cd apps/web
pnpm dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:8081`.

## Development Workflow

### Running Tests

**All Tests**
```bash
pnpm test
```

**Specific Test Types**
```bash
pnpm test:unit     # Frontend unit tests
pnpm test:e2e      # Frontend end-to-end tests
pnpm test:api      # Backend tests
```

You can also use Turbo to run tests for specific applications:
```bash
turbo test --filter=web     # All frontend tests
turbo test --filter=api     # All backend tests
```

Or navigate to individual app directories to run their test commands directly as described in their respective READMEs.

**Frontend Tests**
```bash
cd apps/web
pnpm test:unit  # Unit tests
pnpm test:e2e   # End-to-end tests
```

**Backend Tests**
```bash
cd apps/api
make tests
```

### Linting and Type Checking

**All Applications**
```bash
pnpm lint         # Lint all applications
pnpm type-check   # Type check all applications
```

## Architecture

Singularity follows a modern architecture pattern:

- **Frontend**: React components with custom hooks and contexts for state management
- **Backend**: FastAPI with a structured approach to routing, handlers, and resources
- **Communication**: WebSocket for real-time chat

## Product Roadmap

### v1 (Current)
- ✅ Real-time chat interface with AI
- ✅ Light and dark mode
- ✅ Markdown support in messages
- ✅ WebSocket communication
- ✅ Basic conversation history (stored in context for now)
- ✅ Support for thinking models

### v2 (Planned)
- 🔄 Multi-modal AI support (images, audio)
- 🔄 User authentication
- 🔄 Persistent conversations

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [FastAPI](https://fastapi.tiangolo.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
