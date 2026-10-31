# Online Rental System

An online rental platform for browsing products, creating rentals, processing payments, managing returns, and reviewing product condition with AI-assisted image comparison.

## Features

- Product catalog for electronics and gadgets
- User registration, authentication, and account management
- Product rentals with configurable rental periods
- Stripe payment integration
- Courier delivery or personal pickup
- Rental status tracking
- Product reviews and ratings
- Admin dashboards for products, rentals, and statistics
- Uploading start and return photos
- AI-powered return inspection for detecting damage and model mismatches
- Romanian-language support chatbot

## Project Structure

```
.
├── frontend/                       # React + TypeScript frontend
├── online-rental-system-licenta/   # Spring Boot backend
├── ai-service/                     # FastAPI AI service
├── docker-compose.yml              # Full development environment
└── docker.env.example              # Environment variable template
```

## Technology Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Java 17, Spring Boot, Spring Security, JPA, Flyway
- **Database:** PostgreSQL
- **AI Service:** Python, FastAPI, OpenAI API
- **Payments:** Stripe
- **Deployment:** Docker Compose

## Prerequisites

For the Docker setup, install:

- Docker
- Docker Compose

For running services individually, also install:

- Node.js and npm
- Java 17
- Maven
- Python 3.10 or newer
- PostgreSQL

## Setup with Docker

1. Clone the repository:
    
    ```bash
    git clone https://github.com/BlehoianuRobert/Team-Project.git
    cd Team-Project
    ```
    
2. Create the environment file:
    
    ```bash
    cp docker.env.example .env
    ```
    
3. Edit `.env` and configure the required values.
    
    At minimum, set a secure `JWT_SECRET`. The application can run without an OpenAI key using mock AI responses.
    
4. Start the application with a local PostgreSQL database:
    
    ```bash
    docker compose --profile local-db up --build
    ```
    
5. Open the application:
    - Frontend: http://localhost:3001
    - Backend API: http://localhost:8081
    - AI service: http://localhost:8001
    - AI service health check: http://localhost:8001/health

To stop the services:

```bash
docker compose down
```

To stop the services and remove local database data:

```bash
docker compose --profile local-db down -v
```

## Using an External PostgreSQL Database

The application can use an external PostgreSQL database, such as Neon.

Set the following variables in `.env`:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>/<database>?sslmode=require
SPRING_DATASOURCE_USERNAME=<username>
SPRING_DATASOURCE_PASSWORD=<password>
```

Then start the application without the local database profile:

```bash
docker compose up --build
```

## Optional Environment Variables

```
# AI service
OPENAI_API_KEY=
AI_MODEL=gpt-4o-mini

# Stripe payments
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=

# Frontend origins allowed by the backend
APP_FRONTEND_ORIGIN=http://localhost:3000,http://localhost:3001

# Email confirmation
APP_EMAIL_CONFIRMATION_REQUIRED=false

# Email configuration
SPRING_MAIL_HOST=
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=
SPRING_MAIL_PASSWORD=
```

If `OPENAI_API_KEY` is not provided, rental image comparisons use mock responses and the chatbot reports that it is not configured.

## Running the Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

The Vite development server is normally available at:

```
http://localhost:5173
```

To build the frontend:

```bash
npm run build
```

To run linting:

```bash
npm run lint
```

## Running the Backend Locally

Make sure PostgreSQL is running and create a database named `rental`.

From the repository root:

```bash
cd online-rental-system-licenta
./mvnw spring-boot:run
```

If the Maven wrapper is unavailable, use:

```bash
mvn spring-boot:run
```

The backend runs on:

```
http://localhost:8081
```

For a local PostgreSQL configuration, set:

```bash
export SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/rental"
export SPRING_DATASOURCE_USERNAME="postgres"
export SPRING_DATASOURCE_PASSWORD="postgres"
export JWT_SECRET="change-this-to-a-long-random-secret"
```

Database migrations are applied automatically by Flyway when the backend starts.

## Running the AI Service Locally

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

The AI service runs on:

```
http://localhost:8001
```

Health check:

```bash
curl http://localhost:8001/health
```

## API Documentation

When the backend is running, Springdoc provides API documentation at:

```
http://localhost:8081/swagger-ui/index.html
```

## License

This project is intended for educational and demonstration purposes.
