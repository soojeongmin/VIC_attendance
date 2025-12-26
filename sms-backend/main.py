from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from liroschool import send_absence_sms

app = FastAPI(title="VIC Attendance SMS API")

# CORS 설정 (프론트엔드에서 호출 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://vic-attendance.web.app",
        "https://vic-attendance.firebaseapp.com",
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Student(BaseModel):
    seatId: str
    name: str
    grade: int
    note: Optional[str] = ""

class SMSRequest(BaseModel):
    date: str  # YYYY-MM-DD
    students: List[Student]

class SMSResponse(BaseModel):
    success: bool
    message: str
    sent_count: int
    failed_count: int

@app.get("/")
def health_check():
    return {"status": "ok", "service": "VIC Attendance SMS API"}

@app.post("/send-sms", response_model=SMSResponse)
async def send_sms(request: SMSRequest):
    try:
        result = await send_absence_sms(request.date, request.students)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
