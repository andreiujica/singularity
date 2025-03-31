# Singularity API

A FastAPI-based backend service for the Singularity application. This API provides endpoints for chat functionality and websocket communication.

## Architecture

```
├── src/
│   ├── api/               # API route definitions
│   │   ├── v1/            # API version 1 endpoints
│   │   │   └── chat.py    # Chat endpoints
│   │   └── health.py      # Health check endpoint
│   ├── models/            # Pydantic data models
│   │   └── chat.py        # Chat-related models
│   ├── handlers/          # Business logic handlers
│   │   └── websocket.py   # WebSocket handler logic
│   ├── adapters/          # External service adapters
│   ├── utils/             # Utility functions and classes
│   ├── main.py            # Application entry point
│   └── settings.py        # Application configuration
├── tests/
│   ├── integration/       # Integration tests
│   └── unit/              # Unit tests
└── requirements/          # Dependency management
    ├── prod.in            # Production dependencies
    └── dev.in             # Development dependencies
```

### Architecture Flow

```
Client Request → FastAPI Router → API Endpoint → Handler → Response
                                                  ↓
                            External Services ← Adapters
```

1. **Request Handling**: FastAPI receives HTTP/WebSocket requests and routes them to appropriate endpoints
2. **Data Validation**: Pydantic models validate incoming data
3. **Business Logic**: Handlers process the requests and implement business logic
4. **External Services**: Adapters interface with external services as needed
5. **Response**: Data is returned to the client

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Make

### Setup and Running

1. **Clone the repository**

2. **Environment variables**
   Copy the example env file and update as needed:
   ```
   cp .env.example .env
   ```

3. **Build Docker image**
   ```
   make build
   ```

4. **Compile dependencies** (inside container)
   ```
   make start
   make deps
   ```

5. **Start the application** (inside container)
   ```
   make app
   ```

The API will be available at `http://localhost:8081`.

## Testing

Our testing approach prioritizes integration tests to ensure robust API interactions, with unit tests for specific components.

### Running Tests

Inside the Docker container:
```
make tests
```

This will:
- Run both unit and integration tests
- Generate a coverage report

### Test Structure

- **Integration Tests**: Located in `tests/integration/`, test entire API flows
- **Unit Tests**: Located in `tests/unit/`, test individual components

## Contributing

### Setting Up Development Environment

1. **Start the container in development mode**
   ```
   make start
   ```

2. **Make code changes**
   Docker Compose binds the container volume to your local directory, so changes are reflected immediately.

3. **Run the application with hot reload**
   ```
   make app
   ```

### Adding New Dependencies

1. Add the package to either `requirements/prod.in` or `requirements/dev.in`
2. Compile dependencies (inside container)
   ```
   make deps
   ```

### Code Style

- Follow PEP 8 guidelines
- Use type hints
- Write meaningful docstrings

### Testing Guidelines

- Write integration tests for new API endpoints
- Add unit tests for complex business logic
- Maintain or improve code coverage

## Package.json in a Python Application

Despite being a Python application, this project includes a `package.json` file. This is intentional and serves several purposes:

1. **Monorepo Integration**: This API is part of a larger monorepo structure, and having a package.json file allows it to be recognized and managed by JavaScript-based monorepo tools like Turborepo.

2. **Consistent Developer Experience**: By including npm scripts that wrap Make commands, we provide a consistent interface across all projects in the monorepo, regardless of the underlying technology.

3. **Simplified Commands**: The package.json scripts act as aliases to more complex Docker and Make commands, making it easier for developers to remember and use:
   - `pnpm dev` - Start the development server with hot reload
   - `pnpm build` - Build the Docker image
   - `pnpm install` - Install dependencies
   - `pnpm test` - Run tests
   - `pnpm start` - Start the container with an interactive shell
   - `pnpm stop` - Stop the container

This setup allows both Python developers and those more familiar with JavaScript/pnpm to work comfortably with the codebase.

## FAQ

### How do I add a new API endpoint?

Create a new route function in the appropriate router file in `src/api/`, define request/response models in `src/models/`, and implement business logic in `src/handlers/`.

### How do I connect to external services?

Create an adapter in `src/adapters/` that interfaces with the external service, then use it in your handlers.

### How do I run only specific tests?

Use pytest's filtering:
```
pytest tests/integration/test_specific_file.py::test_specific_function
```

### How do I debug the application?

1. Add breakpoints with `breakpoint()`
2. Run the app with `make app`

### How do I update dependencies?

Edit `requirements/prod.in` or `requirements/dev.in`, then run `make deps`.