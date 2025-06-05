from fastapi import FastAPI
from aetherium.api.v1 import auth_router
app = FastAPI()

app.include_router(auth_router)


@app.get("/")
def read_root():
    return {"message": "E-learning API"}