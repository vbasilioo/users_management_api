#!/bin/sh

echo "Waiting for PostgreSQL to start..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "PostgreSQL started"

echo "Running seed..."
pnpm seed

echo "Starting application..."
pnpm start:prod 