from aetherium.database.db import SessionLocal
from aetherium.models.user import Role

def seed_roles():
    db = SessionLocal()
    try:
        names = [('user',1), ('instructor',2), ('admin',3)]
        for name, id in names:
            existing = db.query(Role).filter(Role.id==id).first()
            if not existing:
                db.add(Role(id=id, name=name))
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    seed_roles()
