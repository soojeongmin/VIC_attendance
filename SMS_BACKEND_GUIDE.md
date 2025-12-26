# 리로스쿨 문자 발송 백엔드 구축 가이드

## 추천: Google Cloud Run (무료)

### 무료 티어 범위
- 월 200만 요청
- 월 360,000 GB-초 컴퓨팅
- 학교 출결 문자 수준은 완전 무료로 충분

### 왜 Cloud Run?
- Docker 컨테이너로 Python + Playwright 실행 가능
- Firebase랑 같은 Google Cloud라서 연동 편함
- 사용할 때만 실행돼서 비용 효율적

---

## 다른 무료 옵션들

| 서비스 | 무료 범위 | Playwright 지원 |
|--------|----------|----------------|
| **Cloud Run** | 넉넉함 | O (Docker) |
| Fly.io | VM 3개 | O |
| Render | 750시간/월 | O (느림) |
| Railway | $5/월 크레딧 | O |

---

## 구현 구조

```
[관리자 페이지] ---> [Python API 서버 (Cloud Run)] ---> [Playwright로 리로스쿨 자동화]
       |                        |
  "문자 전송" 클릭         결석자 정보 받아서
                          리로스쿨에서 문자 발송
```

---

## 구현 흐름

1. Python FastAPI 서버 만들기
2. Playwright로 리로스쿨 로그인 → 문자 발송 자동화
3. React에서 API 호출 (POST /send-sms with 결석자 리스트)
4. 관리자 페이지에 "문자 전송" 버튼 추가

---

## 준비물

1. **Google Cloud 계정**
   - 카드 등록은 필요하지만 무료 티어 내에선 과금 안됨

2. **리로스쿨 분석 자료**
   - 로그인 페이지 URL
   - 로그인 방식 (아이디/비밀번호? SSO?)
   - 문자 발송 화면 구조
   - 필요한 입력 필드들

---

## 다음 단계

리로스쿨 Playwright 분석 자료 주시면:
1. Python 백엔드 코드 작성
2. Dockerfile 작성
3. Cloud Run 배포 가이드 제공
4. 관리자 페이지에 문자 전송 버튼 추가

진행하시려면 리로스쿨 화면 분석 자료를 공유해주세요!
