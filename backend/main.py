from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
import httpx
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
import os
from groq import AsyncGroq
from model import Reviews,Review_result,updated_review,UserRegister,UserLogin
import json
from fastapi.middleware.cors import CORSMiddleware
from uuid import UUID
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

from supabase import create_client

load_dotenv()
client=AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))
app=FastAPI()
app.add_middleware(
    CORSMiddleware,allow_origins=["http://localhost:5173"],
    allow_credentials=True,allow_methods=["*"],allow_headers=["*"]
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
JWT_SECRET = os.environ.get("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.environ.get("GOOGLE_REDIRECT_URI")
FRONTEND_URL = os.environ.get("FRONTEND_URL")


# Google OAuth - Step 1: Redirect user to Google's consent screen
@app.get("/api/auth/google/login")
async def google_login():
    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_CLIENT_ID}"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        "&response_type=code"
        "&scope=openid email profile"
        "&access_type=offline"
    )
    return RedirectResponse(google_auth_url)

# Google OAuth - Step 2: Handle Google's callback
@app.get("/api/auth/google/callback")
async def google_callback(code: str):
    # Exchange the authorization code for an access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        token_data = token_response.json()
        google_access_token = token_data.get("access_token")

        if not google_access_token:
            raise HTTPException(status_code=400, detail="Failed to authenticate with Google")

        # Fetch the user's profile info from Google
        userinfo_response = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {google_access_token}"},
        )
        google_user = userinfo_response.json()
        email = google_user.get("email")

    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from Google")

    # Check if this user already exists; if not, create them
    existing = supabase.table("users_review_analyzer").select("*").eq("email", email).execute()
    if not existing.data:
        # OAuth users get a placeholder hash they can never log in with via password
        placeholder_password = hash_password(f"oauth-google-{email}-{os.urandom(8).hex()}")
        supabase.table("users_review_analyzer").insert({
            "email": email,
            "password": placeholder_password,
        }).execute()

    # Issue our own JWT, same as regular login
    token = create_access_token({"sub": email})

    # Redirect back to the frontend with the token
    return RedirectResponse(f"{FRONTEND_URL}/oauth/callback?token={token}")
# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"message": "Too many requests. Please try again later."}
    )

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Helper functions
def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Register endpoint
@app.post("/api/auth/register", status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, user: UserRegister):
    # Check if email already exists
    existing = supabase.table("users_review_analyzer").select("*").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed = hash_password(user.password)
    
    # Store in database
    result = supabase.table("users_review_analyzer").insert({
        "email": user.email,
        "password": hashed
    }).execute()
    
    return {"message": "User registered successfully"}

# Login endpoint
@app.post("/api/auth/login", status_code=200)
@limiter.limit("5/minute")
async def login(request: Request, user: UserLogin):
    # Find user
    result = supabase.table("users_review_analyzer").select("*").eq("email", user.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    db_user = result.data[0]
    
    # Verify password
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT
    token = create_access_token({"sub": user.email})
    
    return {"access_token": token, "token_type": "bearer"}

# Protected route example
@app.get("/api/auth/me", status_code=200)
async def get_current_user(email: str = Depends(verify_token)):
    result = supabase.table("users_review_analyzer").select("id", "email", "created_at").eq("email", email).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]




@app.exception_handler(Exception)
async def global_exception_handlers(request:Request,exc:Exception):
    return JSONResponse(
        status_code=500,
        content={
            "message":"internal server error",
            "error":str(exc)
        }
    )
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

@app.post("/classify",status_code=201)
async def classify_reviews(review:Reviews):
    
    system_prompt = """You are an expert hospitality analytics assistant. Analyze the provided guest reviews.
    Return a JSON object with a "review" array. Each object in the array must have:
    - "sentiment" (Positive/Neutral/Negative)
    - "theme" (Food/Host/Location/Cleanliness/Value/Experience)
    - "suggested_response" (One-line management reply)
    Do not return any text other than the raw JSON."""
    response = await client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role":"system","content":system_prompt},{"role":"user","content":review.review}],
    response_format={"type": "json_object"}
    )
    result = json.loads(response.choices[0].message.content)
    new=Review_result(review_text=review.review,
                       sentiment=result["review"][0]["sentiment"],
                       theme=result["review"][0]["theme"],
                       suggested_response=result["review"][0]["suggested_response"],

    )
    supabase.table("review_analyzer").insert(new.model_dump(mode="json")).execute()

    print(result)

    return new

@app.get("/read/{id}",status_code=200)
def read_reviews_id(id:UUID,email: str = Depends(verify_token)):
    response = supabase.table("review_analyzer").select("*").eq("id", str(id)).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return response.data
@app.get("/read",status_code=200)
def read_reviews(email: str = Depends(verify_token)):
    response=supabase.table("review_analyzer").select("*").execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return response.data

@app.delete("/delete/{id}",status_code=204)
def delete_review(id:UUID,email: str = Depends(verify_token)):
    response=supabase.table("review_analyzer").delete().eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return None
    
@app.put("/update/{id}",status_code=200)
def update_review(id:UUID,updated: Review_result,email: str = Depends(verify_token)):
    response=supabase.table("review_analyzer").update(updated.model_dump(mode="json")).eq("id", str(id)).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return response.data
@app.get("/search",status_code=200)
def filter_reviews(sentiment:str,email: str = Depends(verify_token)):
    response=supabase.table("review_analyzer").select("*").eq("sentiment", sentiment).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return response.data
    
@app.patch("/update/{id}",status_code=200)
def update(id:UUID,updated: updated_review,email: str = Depends(verify_token)):
    response = supabase.table("review_analyzer").update(updated.model_dump(mode="json",exclude_unset=True)).eq("id", str(id)).execute()

    if not response.data:
        raise HTTPException(status_code=404, detail="not found")

    return response.data

