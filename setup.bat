@echo off
echo ========================================
echo VIC_attendance 프로젝트 환경 설정
echo ========================================
echo.

REM .env 파일 확인
if not exist .env (
    echo .env 파일이 없습니다. .env.example을 복사합니다...
    copy .env.example .env
    echo.
    echo .env 파일이 생성되었습니다.
    echo 파일을 열어서 실제 Supabase 정보로 변경해주세요.
    echo.
) else (
    echo .env 파일이 이미 존재합니다.
    echo.
)

echo Supabase Project URL을 입력하세요:
set /p SUPABASE_URL=URL:

echo.
echo Supabase Anon Key를 입력하세요:
set /p SUPABASE_ANON_KEY=Key:

REM .env 파일에 작성
(
    echo # Supabase 환경변수 설정
    echo SUPABASE_URL=%SUPABASE_URL%
    echo SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%
) > .env

echo.
echo ========================================
echo 환경변수가 .env 파일에 저장되었습니다!
echo ========================================
echo.
echo 다음 단계:
echo 1. claude 명령어로 Claude Code를 실행하세요
echo 2. MCP 서버 연결 확인: claude mcp list
echo.
pause
