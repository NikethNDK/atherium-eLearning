# Docker Hub & AWS Deployment

Production uses the image **niketh7/aetherium-backend** from Docker Hub. The EC2 instance pulls this image; no build on server.

## Build and push image (from your machine or CI)

From the **BackEnd** directory:

```bash
# Build
docker build -t niketh7/aetherium-backend:latest .

# Push (log in first: docker login)
docker push niketh7/aetherium-backend:latest
```

## On the AWS EC2 instance

1. Copy `docker-compose.prod.yml` and create `.env.prod` from `.env.prod.example` (fill in real values).
2. Ensure `uploads/` exists: `mkdir -p uploads`
3. Run:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

To update after pushing a new image:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate backend celery_worker
```
