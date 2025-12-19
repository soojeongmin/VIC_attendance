# VIC_attendance

출석 관리 프로젝트

## 설정 방법

### 1. Supabase 환경변수 설정

`.env` 파일을 열고 실제 Supabase 프로젝트 정보로 변경하세요:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

**Supabase 정보 찾는 방법:**
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. Settings → API 메뉴 선택
4. Project URL과 anon public 키 복사

### 2. MCP 서버 설정

이 프로젝트는 다음 MCP 서버를 사용합니다:

- **Supabase MCP** - Supabase 데이터베이스 연동
- **Google Drive MCP** - Google Drive 파일 관리

### 3. Claude Code에서 프로젝트 실행

```bash
cd VIC_attendance
claude
```

## 프로젝트 구조

```
VIC_attendance/
├── .env                 # Supabase 환경변수 (git 제외)
├── .env.example         # 환경변수 예시
├── .mcp.json           # 프로젝트별 MCP 서버 설정
├── .gitignore          # Git 제외 파일 목록
└── README.md           # 프로젝트 설명
```

## MCP 서버 확인

```bash
claude mcp list
```

## 참고 자료

- [Supabase Documentation](https://supabase.com/docs)
- [Claude Code MCP Guide](https://code.claude.com/docs/en/mcp)
