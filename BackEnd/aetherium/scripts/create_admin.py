from sqlalchemy.orm import Session
from aetherium.database.db import SessionLocal, engine
from aetherium.models.user import User, Role
from aetherium.utils.password_hash import hash_password
import sys

def create_admin(email: str, password: str):
    db: Session = SessionLocal()
    try:
        # Check if admin role exists (id=3)
        admin_role = db.query(Role).filter(Role.id == 3).first()  # or Role.name == "admin"
        if not admin_role:
            print("Error: 'admin' role not found. Ensure roles table has 'admin' (id=3).")
            sys.exit(1)

        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"Error: User with email {email} already exists.")
            sys.exit(1)

        # Hash password
        hashed_password = hash_password(password)

        # Create admin user (use password_hash instead of hashed_password)
        admin_user = User(
            email=email,
            password_hash=hashed_password,  # ✅ Correct column name
            role_id=admin_role.id,  # role_id=3 for admin
            is_active=True,
            is_emailverified=True  # Skip OTP for admin
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        print(f"✅ Admin user created: {email}, Role: admin (ID: {admin_role.id})")
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python -m aetherium.scripts.create_admin <email> <password>")
        sys.exit(1)
    email, password = sys.argv[1], sys.argv[2]
    create_admin(email, password)