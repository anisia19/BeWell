#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "==> Starting MySQL test container..."
docker compose -f docker-compose.test.yml up -d --wait

echo "==> Installing dependencies..."
npm install

echo "==> Running acceptance tests..."
NODE_ENV=test npm test
EXIT_CODE=$?

echo "==> Stopping MySQL test container..."
docker compose -f docker-compose.test.yml down

exit $EXIT_CODE
