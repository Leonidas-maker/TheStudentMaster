# syntax=docker/dockerfile:1

# Use Python 3.12 slim as the base image for reduced size and security.
FROM python:3.12-slim as base

# Prevent Python from writing .pyc files.
ENV PYTHONDONTWRITEBYTECODE=1

# Ensure stdout and stderr are unbuffered.
ENV PYTHONUNBUFFERED=1

# Set terminal type.
ENV TERM=xterm

# Set the working directory inside the container.
WORKDIR /app

# Create a non-privileged user to run the application.
# This enhances security by avoiding running as root.
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/home/appuser" \ 
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Install build dependencies and Python packages.
# Using a cache mount for pip to speed up builds.
# Using a bind mount for requirements.txt to leverage Docker caching.
RUN --mount=type=cache,target=/root/.cache/pip \
    --mount=type=bind,source=requirements.txt,target=/app/requirements.txt \
    python -m pip install --upgrade pip && \
    python -m pip install -r requirements.txt

# Create necessary directories and assign permissions to appuser
RUN mkdir -p /app/config/certs /home/appuser/.cache/fastapi-cdn-host && \
    chown -R appuser:appuser /app/config/certs /home/appuser/.cache

# Switch to the non-privileged user.
USER appuser

# Copy the application source code into the container.
COPY . .

# Expose the port that the FastAPI application listens on.
EXPOSE 8001

# Define the command to run the FastAPI application with 4 workers and auto-reload.
# Note: The --reload flag is typically used for development and may not be suitable for production.
CMD ["fastapi", "run", "main.py", "--workers", "4", "--port", "8001", "--host", "0.0.0.0"]
