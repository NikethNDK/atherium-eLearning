import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context




# Add your project root to sys.path (so Python can find 'aetherium')
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


# Load your app settings and models
from aetherium.config import settings



# Read Alembic config
config = context.config

# Inject your DB URL into Alembic config (from .env via Pydantic settings)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Set up loggers
fileConfig(config.config_file_name)

# Set target metadata for autogenerate to detect models
target_metadata = None

# Functions Alembic uses to run migrations
def run_migrations_offline():
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()