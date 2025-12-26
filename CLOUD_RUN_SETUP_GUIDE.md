# Google Cloud Run + Playwright 문자 발송 서버 구축 가이드

## 1단계: Google Cloud 계정 설정

### 1-1. Google Cloud Console 접속
1. https://console.cloud.google.com 접속
2. Google 계정으로 로그인
3. 처음이면 무료 체험 활성화 (카드 등록 필요, 무료 범위 내 과금 없음)

### 1-2. 새 프로젝트 생성
1. 상단의 프로젝트 선택 드롭다운 클릭
2. "새 프로젝트" 클릭
3. 프로젝트 이름: `vic-attendance-sms`
4. "만들기" 클릭

### 1-3. Cloud Run API 활성화
1. 좌측 메뉴 → "API 및 서비스" → "라이브러리"
2. "Cloud Run Admin API" 검색
3. "사용" 클릭

---

## 2단계: Google Cloud CLI 설치

### Windows
1. https://cloud.google.com/sdk/docs/install 접속
2. Windows용 설치 파일 다운로드
3. 설치 후 터미널에서 확인:
```bash
gcloud --version
```

### 로그인 및 프로젝트 설정
```bash
gcloud auth login
gcloud config set project vic-attendance-sms
```

---

## 3단계: Python 백엔드 프로젝트 생성

### 3-1. 폴더 구조
```
vic-attendance/
└── sms-backend/
    ├── main.py              # FastAPI 서버
    ├── liroschool.py        # 리로스쿨 Playwright 자동화
    ├── requirements.txt     # Python 패키지
    ├── Dockerfile           # Docker 설정
    └── .env.example         # 환경변수 예시
```

### 3-2. requirements.txt
```
fastapi==0.104.1
uvicorn==0.24.0
playwright==1.40.0
python-dotenv==1.0.0
pydantic==2.5.0
```

### 3-3. main.py (FastAPI 서버)
```python
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
```

### 3-4. liroschool.py (Playwright 자동화 - 템플릿)
```python
from playwright.async_api import async_playwright
import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

# 환경변수에서 로그인 정보 가져오기
LIRO_USERNAME = os.getenv("LIRO_USERNAME")
LIRO_PASSWORD = os.getenv("LIRO_PASSWORD")

async def send_absence_sms(date: str, students: List[dict]) -> dict:
    """
    리로스쿨에서 결석 문자 발송

    TODO: 리로스쿨 분석 후 실제 코드 작성
    """
    sent_count = 0
    failed_count = 0

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            # TODO: 리로스쿨 로그인
            # await page.goto("리로스쿨 URL")
            # await page.fill("#username", LIRO_USERNAME)
            # await page.fill("#password", LIRO_PASSWORD)
            # await page.click("로그인 버튼")

            # TODO: 문자 발송 페이지로 이동

            # TODO: 각 학생에게 문자 발송
            for student in students:
                try:
                    # 문자 발송 로직
                    # await page.fill("수신자", student["name"])
                    # await page.fill("내용", f"{date} 면학실 결석")
                    # await page.click("발송")
                    sent_count += 1
                except Exception as e:
                    print(f"Failed to send SMS to {student['name']}: {e}")
                    failed_count += 1

        finally:
            await browser.close()

    return {
        "success": failed_count == 0,
        "message": f"발송 완료: {sent_count}명 성공, {failed_count}명 실패",
        "sent_count": sent_count,
        "failed_count": failed_count
    }
```

### 3-5. Dockerfile
```dockerfile
FROM python:3.11-slim

# Playwright 브라우저 설치에 필요한 패키지
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python 패키지 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Playwright 브라우저 설치
RUN playwright install chromium
RUN playwright install-deps chromium

# 소스코드 복사
COPY . .

# Cloud Run은 PORT 환경변수 사용
ENV PORT=8080
EXPOSE 8080

# 서버 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### 3-6. .env.example
```
LIRO_USERNAME=your_username
LIRO_PASSWORD=your_password
```

---

## 4단계: 로컬 테스트

### 4-1. 가상환경 생성 및 패키지 설치
```bash
cd sms-backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
playwright install chromium
```

### 4-2. 환경변수 설정
```bash
copy .env.example .env
# .env 파일 열어서 리로스쿨 계정 정보 입력
```

### 4-3. 서버 실행
```bash
uvicorn main:app --reload --port 8080
```

### 4-4. 테스트
브라우저에서 http://localhost:8080 접속 → {"status": "ok"} 확인

---

## 5단계: Cloud Run 배포

### 5-1. Docker 이미지 빌드 & 푸시
```bash
# Google Container Registry에 직접 빌드 & 푸시
gcloud builds submit --tag gcr.io/vic-attendance-sms/sms-backend
```

### 5-2. Cloud Run 배포
```bash
gcloud run deploy sms-backend \
  --image gcr.io/vic-attendance-sms/sms-backend \
  --platform managed \
  --region asia-northeast3 \
  --allow-unauthenticated \
  --memory 1Gi \
  --timeout 300 \
  --set-env-vars "LIRO_USERNAME=아이디,LIRO_PASSWORD=비밀번호"
```

### 5-3. 배포 완료 후
배포 완료되면 URL이 나옴:
```
https://sms-backend-xxxxxx-du.a.run.app
```

이 URL을 React 앱에서 사용!

---

## 6단계: React 프론트엔드 연동

### 6-1. 환경변수 설정
`.env` 파일 또는 코드에 Cloud Run URL 추가

### 6-2. 관리자 페이지에 문자 전송 버튼 추가
내보내기 모달에 "문자 발송" 버튼 추가 → API 호출

---

## 다음 단계

1. **리로스쿨 분석 자료 제공** → `liroschool.py` 실제 코드 작성
2. **로컬 테스트** 완료
3. **Cloud Run 배포**
4. **React 연동**

리로스쿨 로그인 페이지, 문자 발송 화면 스크린샷이나 URL 주시면 Playwright 코드 작성해드릴게요!
