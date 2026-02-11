from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from supabase import create_client, Client
import jwt
import hashlib


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase connection
supabase_url = os.environ['SUPABASE_URL']
supabase_key = os.environ['SUPABASE_KEY']
supabase: Client = create_client(supabase_url, supabase_key)

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Auth Models
class UserRegister(BaseModel):
    nome: str
    email: str
    senha: str
    tipo: str = "Operador"

class UserLogin(BaseModel):
    email: str
    senha: str

class User(BaseModel):
    id: str
    nome: str
    email: str
    tipo: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(
        id=str(uuid.uuid4()),
        client_name=input.client_name,
        timestamp=datetime.now(timezone.utc)
    )
    
    # Convert to dict for Supabase
    doc = {
        "id": status_obj.id,
        "client_name": status_obj.client_name,
        "timestamp": status_obj.timestamp.isoformat()
    }
    
    try:
        result = supabase.table("status_checks").insert(doc).execute()
        return status_obj
    except Exception as e:
        logger.error(f"Error inserting status check: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    try:
        response = supabase.table("status_checks").select("*").execute()
        
        # Convert ISO string timestamps back to datetime objects
        status_checks = []
        for check in response.data:
            if isinstance(check['timestamp'], str):
                check['timestamp'] = datetime.fromisoformat(check['timestamp'].replace('Z', '+00:00'))
            status_checks.append(StatusCheck(**check))
        
        return status_checks
    except Exception as e:
        logger.error(f"Error fetching status checks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Authentication endpoints
@api_router.post("/auth/register")
async def register_user(user_data: UserRegister):
    try:
        # Hash password
        password_hash = hashlib.sha256(user_data.senha.encode()).hexdigest()
        
        # Create user object
        user_doc = {
            "id": str(uuid.uuid4()),
            "nome": user_data.nome,
            "email": user_data.email,
            "senha": password_hash,
            "tipo": user_data.tipo,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert into Supabase
        result = supabase.table("users").insert(user_doc).execute()
        
        return {"message": "Usuário cadastrado com sucesso!", "user_id": user_doc["id"]}
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login")
async def login_user(login_data: UserLogin):
    try:
        # Hash password for comparison
        password_hash = hashlib.sha256(login_data.senha.encode()).hexdigest()
        
        # Query user from Supabase
        response = supabase.table("users").select("*").eq("email", login_data.email).eq("senha", password_hash).execute()
        
        if not response.data:
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
        user = response.data[0]
        
        # Create simple token (in production, use proper JWT)
        token = f"token_{user['id']}_{datetime.now().timestamp()}"
        
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "nome": user["nome"],
                "email": user["email"],
                "tipo": user["tipo"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error logging in user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
