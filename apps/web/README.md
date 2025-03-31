# Singularity Web Frontend

A modern, responsive web application built with Next.js and React for the Singularity platform. This frontend provides a user-friendly interface for interacting with the Singularity AI chat functionality.

## Architecture

```
├── app/                 # Next.js app directory (App Router)
│   ├── page.tsx         # Home page
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── chat/            # Chat-related components
│   ├── header/          # Header components
│   └── sidebar/         # Sidebar components
├── contexts/            # React Context providers
├── hooks/               # Custom React hooks
├── providers/           # Provider components
├── handlers/            # Event handlers
├── lib/                 # Shared utilities and libraries
├── utils/               # Utility functions
├── constants/           # Application constants
├── types/               # TypeScript type definitions
└── tests/               # Test files
    ├── e2e/             # End-to-end tests (Playwright)
    └── unit/            # Unit tests (Vitest)
```

### Architecture Flow

```
User Interaction → React Component → Custom Hook/Context → API Handler → Backend API
                 ↑                                      ↓
                 └──────────────── State Update ────────┘
```

1. **User Interface**: Built with React components that handle user interactions
2. **State Management**: Uses React Context and custom hooks for managing application state
3. **API Communication**: Communicates with the backend API through API handlers
4. **Responsive Design**: Utilizes Tailwind CSS for responsive and adaptive layouts
5. **TypeScript**: Ensures type safety throughout the application

## Getting Started

### Prerequisites

- Node.js (latest LTS version recommended)
- pnpm package manager

### Setup and Running

1. **Install dependencies**
   ```
   pnpm install
   ```

2. **Environment variables**
   Copy the example env file and update as needed:
   ```
   cp .env.example .env
   ```

3. **Start development server**
   ```
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

## Technologies

- **Framework**: Next.js with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**:
  - Playwright for E2E tests
  - Vitest for unit tests
- **Type Safety**: TypeScript

## Features

- Real-time chat interface with AI
- Responsive design for mobile and desktop
- Light and dark mode support
- Markdown rendering for chat messages
- Message feedback system

## Testing

The application uses a comprehensive testing strategy with both unit and end-to-end tests.

### Running Tests

For unit tests:
```
pnpm test:unit
```

For end-to-end tests:
```
pnpm test:e2e
```

### Test Structure

- **Unit Tests**: Located in `tests/unit/`, test individual components and hooks
- **E2E Tests**: Located in `tests/e2e/`, test complete user flows

## Contributing

### Development Workflow

1. **Start the development server**
   ```
   pnpm dev
   ```

2. **Make changes to the codebase**

3. **Check types and lint**
   ```
   pnpm check-types
   pnpm lint
   ```

4. **Run tests**
   ```
   pnpm test:unit
   ```

5. **Submit a PR with your changes**


### Code Style

- Follow the project's TypeScript and ESLint configurations
- Use functional components with hooks
- Implement proper type definitions
- Write meaningful comments

## UI Architecture

The Singularity frontend follows a component-based architecture with a focus on reusability and separation of concerns:

### Component Hierarchy

```
Layout (app/layout.tsx)
├── ThemeProvider
├── ChatProvider
└── Page Content (app/page.tsx)
    ├── Header
    │   └── Navigation elements
    ├── Sidebar
    │   └── Navigation/filtering options
    └── Main Content
        ├── Chat Interface
        │   ├── Message Bubbles (user/assistant)
        │   ├── Input Area
        │   └── Action Buttons
        └── Welcome Screen (for new sessions)
```


### State Management

- **React Context**: Global state is managed via context providers (`ChatProvider`, etc.)
- **Custom Hooks**: Encapsulate and share stateful logic (`useConversationGroups`, `useAutoScroll`, etc.)
- **Local Component State**: Component-specific state remains local where appropriate

## Design Considerations

### Responsive Design

- **Breakpoint System**: Consistent breakpoints used throughout the application
- **Touch-Friendly UI**: Elements sized appropriately for touch interactions on mobile devices

### Performance

- **Optimized Assets**: Images and icons optimized for web delivery
- **Memoization**: React `useMemo` and `useCallback` used to prevent unnecessary re-renders

### Visual Consistency

- **Light and Dark Mode**: Full support for both color modes via `next-themes`
- **Component Library**: Shared UI components from `@workspace/ui` via `shadcn-ui`
- **Typography**: Geist font family for both sans and mono text
- **Iconography**: Consistent use of Lucide React icons

### User Experience

- **Real-Time Feedback**: Immediate UI responses to user actions
- **Error Handling**: Graceful error states and recovery options
- **Loading States**: Clear loading indicators for asynchronous operations

## FAQ

### How do I add a new page?

Create a new file or directory in the `app/` directory following Next.js App Router conventions.

### How do I style components?

Use Tailwind CSS utility classes for styling. For complex components, consider using the component composition pattern.

### How do I connect to the backend API?

Use the API handlers in the `handlers/` directory, which abstract the communication with the backend.

### How do I add new dependencies?

```
pnpm add <package-name>
```

For dev dependencies:
```
pnpm add -D <package-name>
```

### How do I debug the application?

1. Use the browser's developer tools
2. Add `console.log` statements or use the debugger statement
3. For component debugging, use React DevTools
