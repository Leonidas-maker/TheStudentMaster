ARG PYTHON_VERSION=3.13.3
FROM python:${PYTHON_VERSION}-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TERM=xterm-256color

WORKDIR /app


RUN apt-get update && apt-get install -y curl build-essential

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m pip install -r requirements.txt

RUN mkdir -p /app/config/keyfiles && chown -R appuser:appuser /app/config/keyfiles
RUN mkdir -p /app/config/verifications && chown -R appuser:appuser /app/config/verifications

USER appuser

COPY . .

USER root
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host=0.0.0.0", "--port=8001"]
