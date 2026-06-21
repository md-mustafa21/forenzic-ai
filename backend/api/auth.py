from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    token: str
    tier: str

@router.post("/login", response_model=UserResponse)
def login(req: LoginRequest):
    """
    Standard mock endpoint simulating secure auth and returning JWT tokens.
    """
    email_lower = req.email.lower()
    if not email_lower or "@" not in email_lower:
        raise HTTPException(status_code=400, detail="Invalid email address.")
        
    # Simulate database authentication
    name = email_lower.split("@")[0].title()
    token = f"jwt_token_forenzic_{uuid.uuid4().hex[:16]}"
    
    return {
        "id": f"usr_{uuid.uuid4().hex[:8]}",
        "name": name,
        "email": req.email,
        "token": token,
        "tier": "Premium Elite Partner" if "admin" in email_lower else "Developer Pro"
    }

@router.post("/signup", response_model=UserResponse)
def signup(req: SignupRequest):
    """
    Standard mock signup endpoint.
    """
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if "@" not in req.email:
        raise HTTPException(status_code=400, detail="Invalid email format.")
        
    token = f"jwt_token_forenzic_{uuid.uuid4().hex[:16]}"
    
    return {
        "id": f"usr_{uuid.uuid4().hex[:8]}",
        "name": req.name,
        "email": req.email,
        "token": token,
        "tier": "Developer Pro"
    }
