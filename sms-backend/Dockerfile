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
