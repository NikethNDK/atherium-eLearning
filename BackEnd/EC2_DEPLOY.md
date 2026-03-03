# EC2 deployment – step-by-step

Use this when you’re SSH’d into your EC2 instance (e.g. from Cursor). Do everything below **on the EC2 instance** unless noted.

---

## Prerequisites (before you start)

- **DNS**: In GoDaddy, create an **A record** for `api.aetherium.wiki` pointing to your EC2 **public IP** (or a CNAME if you use a load balancer).
- **Security group**: EC2 must allow:
  - **22** (SSH)
  - **80** (HTTP – for Let’s Encrypt and redirect)
  - **443** (HTTPS)
- **Docker image**: You must have already run (from your **local** machine, in `BackEnd/`):
  ```bash
  docker build -t niketh7/aetherium-backend:latest .
  docker push niketh7/aetherium-backend:latest
  ```

---

## Step 1: Install Docker and Docker Compose on EC2

**Amazon Linux 2:**

```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

Install Docker Compose v2:

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**Ubuntu:**

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

Log out and log back in (or start a new SSH session) so `docker` works without `sudo`. Verify:

```bash
docker --version
docker compose version
```

---

## Step 2: Get the code onto EC2

Clone the repo (replace with your real repo URL if private):

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/atherium-eLearning.git
cd atherium-eLearning/BackEnd
```

If the repo is private, use SSH or a personal access token. You can also copy the **BackEnd** folder via SCP/SFTP from your machine; the EC2 needs at least:

- `docker-compose.prod.yml`
- `nginx/default-pro.conf`
- `.env.prod` (you’ll create this in the next step)

---

## Step 3: Create production env file

```bash
cp .env.prod.example .env.prod
nano .env.prod   # or vi .env.prod
```

Fill in **real** values for:

- `SECRET_KEY` – long random string (e.g. `openssl rand -hex 32`)
- `DATABASE_URL` – must match Postgres settings:  
  `postgresql://POSTGRES_USER:POSTGRES_PASSWORD@postgres:5432/POSTGRES_DB`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` – same as in `DATABASE_URL`
- `FRONTEND_URL` – `https://aetherium.wiki` (or `https://www.aetherium.wiki` if that’s your canonical URL)
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI=https://api.aetherium.wiki/auth/google/callback`
- SMTP: `SMTP_SERVER`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `FROM_EMAIL`
- Razorpay: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

Leave `REDIS_HOST=redis`, `REDIS_PORT=6379`, `REDIS_DB=0`, `REDIS_URL=redis://redis:6379/0` as-is (they match the Redis service in Docker).

Save and exit (`Ctrl+O`, Enter, `Ctrl+X` in nano).

---

## Step 4: Create uploads directory

```bash
mkdir -p uploads
```

---

## Step 5: Get SSL certificate (Let’s Encrypt)

The Nginx config expects certificates at `/etc/letsencrypt/live/api.aetherium.wiki/`. Get them **before** starting Docker so port 80 is free for certbot.

Install certbot (Amazon Linux 2):

```bash
sudo yum install -y certbot
```

Ubuntu:

```bash
sudo apt install -y certbot
```

Request certificate (nothing should be using port 80 yet):

```bash
sudo certbot certonly --standalone -d api.aetherium.wiki --non-interactive --agree-tos -m your-email@example.com
```

Use your real email. If you get “port 80 already in use”, stop any service using 80, then run the command again.

Certificates will be at:

- `/etc/letsencrypt/live/api.aetherium.wiki/fullchain.pem`
- `/etc/letsencrypt/live/api.aetherium.wiki/privkey.pem`

`docker-compose.prod.yml` already mounts `/etc/letsencrypt` into the Nginx container, so no extra config is needed.

---

## Step 6: Pull images and start the stack

From `~/atherium-eLearning/BackEnd` (or wherever your `docker-compose.prod.yml` and `.env.prod` are):

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

Check that containers are running:

```bash
docker compose -f docker-compose.prod.yml ps
```

You should see `backend`, `nginx`, `postgres`, `redis`, `celery_worker` (all “Up”).

---

## Step 7: Run database migrations (first time only)

Backend uses Alembic. Run migrations inside the backend container:

```bash
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

If your image doesn’t have a default command that keeps the process running and you only have the app process, use:

```bash
docker compose -f docker-compose.prod.yml run --rm backend alembic upgrade head
```

Use whichever works with your setup.

---

## Step 8: Verify

- **HTTPS**: Open `https://api.aetherium.wiki` in a browser (or `curl -I https://api.aetherium.wiki`). You should get a 200 or a FastAPI response.
- **WebSocket**: Frontend should connect to `wss://api.aetherium.wiki/ws/...` when deployed (e.g. on Vercel with `VITE_WS_URL=wss://api.aetherium.wiki`).

If something fails, check logs:

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f nginx
```

---

## Optional: Renew SSL automatically

Let’s Encrypt certs expire in 90 days. Add a cron job:

```bash
sudo crontab -e
```

Add:

```
0 3 * * * certbot renew --quiet --deploy-hook "docker compose -f /home/ec2-user/atherium-eLearning/BackEnd/docker-compose.prod.yml restart nginx"
```

Adjust the path to your `docker-compose.prod.yml` and user (`ec2-user` vs `ubuntu`). The deploy-hook restarts Nginx so it reloads the new cert.

---

## Updating the app later

1. **Push a new image** from your local machine (in `BackEnd/`):
   ```bash
   docker build -t niketh7/aetherium-backend:latest .
   docker push niketh7/aetherium-backend:latest
   ```

2. **On EC2** (in `atherium-eLearning/BackEnd`):
   ```bash
   git pull
   docker compose -f docker-compose.prod.yml pull
   docker compose -f docker-compose.prod.yml up -d --force-recreate backend celery_worker
   docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
   ```

---

## Quick reference – directory layout on EC2

After following the steps, you should have something like:

```
~/atherium-eLearning/
  BackEnd/
    docker-compose.prod.yml
    .env.prod
    nginx/
      default-pro.conf
    uploads/
```

Containers use the image `niketh7/aetherium-backend:latest` from Docker Hub; no build is run on EC2.
