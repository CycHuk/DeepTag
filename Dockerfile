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

WORKDIR /app

RUN pip install "poetry>=1.9.0"

COPY pyproject.toml poetry.lock /app/

RUN poetry install --only main --no-root


COPY . /app/


ENV DJANGO_SETTINGS_MODULE=config.settings
ENV PYTHONUNBUFFERED=1

RUN poetry run python manage.py collectstatic --noinput
RUN poetry run python manage.py migrate

CMD sh -c "poetry run gunicorn --workers ${WORKERS:-1} --bind 0.0.0.0:${PORT:-8000} config.wsgi:application"