# ========================
# 1. Сборка фронтенда
# ========================
FROM node:20-bullseye AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ========================
# 2. Основной Python образ
# ========================
FROM python:3.13-slim

RUN apt-get update && apt-get install -y \
    pkg-config \
    default-libmysqlclient-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install "poetry>=1.9.0"

COPY pyproject.toml poetry.lock ./

RUN poetry install --only main --no-root

COPY . .

# Копируем результат npm run build
COPY --from=frontend-build /app/static/styles.css /app/static/styles.css

ENV DJANGO_SETTINGS_MODULE=config.settings
ENV PYTHONUNBUFFERED=1

RUN poetry run python manage.py collectstatic --noinput

CMD sh -c "poetry run gunicorn --workers ${WORKERS:-1} --bind 0.0.0.0:${PORT:-8000} config.wsgi:application"