# 📚 Aetherium eLearning Platform - Backend

This is the **backend** of the Aetherium eLearning platform, built using **FastAPI**, **PostgreSQL**, and **JWT Authentication**.

---

## Technologies Used

-FastAPI
- PostgreSQL
-JWT for Authentication
- Google OAuth with Authlib
- SQLAlchemy & Alembic for ORM and Migrations
- Razorpay for payment integration
- Cloudinary for stroring the files
- Redis for in memory caching and as a broker to the Celery
- Celery for background task
---

## Getting Started
create the environment for the aetherium project
### Clone the Repository

```bash
git clone https://github.com/NikethNDK/atherium-eLearning.git
cd atherium-eLearning/BackEnd

after that install the requirement.txt to get the dependencies

Prepare a .env file with the below details.
SECRET_KEY
ALGORITHM
ACCESS_TOKEN_EXPIRE_MIN
DATABASE_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI

# Email configuration
SMTP_SERVER
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
FROM_EMAIL

# Redis configuration
REDIS_HOST
REDIS_PORT
REDIS_DB
FRONTEND_URL

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET


CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

Now do the alembic revision and upgrade commands to create the migration history and database update. using the below commands
alembic revision --autogenerate -m "Initital Migration"
alembic upgrade head

after creating the table create the roles using the sql query
role        |   role_id
---------------------
user               1
instructor         2
admin              3

Now run the create_admin.py script using the below command. This will create teh admin user with the given email and password
python -m aetherium.scripts.create_admin  <abc@example.com> <password>

now run the below command to to initialize the redis server in the ubuntu wsl
sudo service redis-server start 

run the below command to initialize the celery
celery -A aetherium.utils.celery_worker worker --loglevel=info --pool=solo

