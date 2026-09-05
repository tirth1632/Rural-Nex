# Rural-Nex

Rural-Nex is an AI-powered Business Advisory and Feasibility platform designed to help rural entrepreneurs and field officers assess the viability of business ideas. It evaluates financial eligibility, calculates market opportunity, analyzes competitor density, and generates comprehensive risk-assessed feasibility reports.

## Project Structure

This monorepo follows a clean, highly modular architecture combining a Django backend with a React frontend.

```text
Rural-Nex/
├── backend/                  # Django REST Framework backend
│   ├── manage.py
│   ├── config/               # Core Django settings and root URLs
│   ├── advisory/             # AI advisory & reports app
│   ├── chat/                 # Conversational AI app
│   ├── finance/              # Financial engine app
│   ├── geo/                  # Geospatial and location models
│   ├── users/                # Authentication & profiles
│   ├── integrations/         # External provider integrations
│   ├── market/               # Market data aggregation
│   ├── business/             # Core business models
│   └── core/                 # Shared utilities and base models
│
├── frontend/                 # React (Vite) frontend application
│   ├── package.json
│   ├── public/               # Static assets
│   └── src/
│       ├── api/              # Axios instances & API calls
│       ├── components/       # Reusable UI components
│       ├── context/          # React Context (Auth, Theme)
│       ├── features/         # Feature-based modules (wizard, chat, etc.)
│       ├── locales/          # i18n translation files
│       └── utils/            # Helper functions
│
├── docs/                     # Project Documentation
│   ├── SECURITY.md           # Security policies and protections
│   └── E2E_TEST_REPORT.md    # End-to-end testing logs and environment limits
│
├── infra/                    # Infrastructure & Deployment configurations
│
└── scripts/                  # Automation and utility scripts
    ├── setup_env.bat         # Windows environment setup script
    └── setup_env.sh          # Linux/macOS environment setup script
```

## Setup & Installation

The primary method for running the application is via Docker Compose, ensuring all dependencies (including native GDAL/GEOS libraries for PostGIS) are correctly orchestrated.

### Prerequisites
- Docker Desktop or Podman installed on your host machine.
- Node.js (for optional native frontend development).

### Quick Start (Docker)

1. Clone the repository.
2. Provide your `.env` configuration (see `.env.example` if available).
3. Start the services:
   ```bash
   docker-compose build
   docker-compose up -d
   ```
4. Run database migrations:
   ```bash
   docker-compose exec backend python manage.py migrate
   ```
5. Access the application:
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:8000`

### Native Setup
If you wish to run the backend natively, refer to the `scripts/` directory for environment setup scripts. Ensure you have properly installed GDAL and GEOS C-libraries for your OS, as they are mandatory for Django's `contrib.gis` PostGIS integration.

## Documentation
For further reading on security measures implemented in the REST backend, see [docs/SECURITY.md](docs/SECURITY.md).
