# DeepTag

DeepTag is a Django-based annotation platform for image labeling and dataset export. The project supports:

- project management with labels and tasks
- image upload and task assignment
- annotation interface for bounding boxes
- YOLO dataset export with labels and images
- asynchronous export processing via Celery
- MySQL, Redis, and S3-compatible media storage (MinIO)

## Key Technologies

- Python 3.13
- Django 5.2
- Poetry for Python dependency management
- Tailwind CSS for frontend styling
- Docker / Docker Compose for local development
- MySQL, Redis, and MinIO services in Docker Compose

## Repository Structure

- `apps/` — Django apps for accounts, projects, tasks, annotations, and labels
- `config/` — Django project settings, URLs, WSGI/ASGI
- `tasks/` — Celery app and export task definitions
- `static/` — static assets and Tailwind source CSS
- `templates/` — shared base templates
- `Dockerfile` — multi-stage build for backend and frontend assets
- `docker-compose.yml` — development services
- `.env.example` — example environment variables

## Requirements

- Docker
- Docker Compose
- Node.js / npm
- Poetry

## Local Development with Docker

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Adjust `.env` values if needed.

3. Start the stack:

   ```bash
   docker compose up --build
   ```

4. Run database migrations and create a superuser inside the web container:

   ```bash
   docker exec -it deeptag poetry run python manage.py migrate
   docker exec -it deeptag poetry run python manage.py createsuperuser
   ```

5. Open the app in your browser:

   - Django app: `http://localhost:8000`
   - phpMyAdmin: `http://localhost:8080`
   - MinIO console: `http://localhost:9001`
