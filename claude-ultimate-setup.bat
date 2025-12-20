@echo off
chcp 65001 >nul 2>&1
setlocal EnableDelayedExpansion

:: ============================================================================
:: Claude Code ULTIMATE Setup - 완전 자동 무인 설치
:: Node.js + Git + Python + Claude + 12 MCP + SuperClaude + BYPASS ALL
:: 질문 없음 / 한글 경로 지원 / 원클릭 완료
:: ============================================================================

title Claude Code ULTIMATE Setup - Full Auto Install

echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║     Claude Code ULTIMATE Setup - FULL AUTO / NO QUESTIONS           ║
echo ║     Git + Node.js + Python + Claude + 12 MCP + SuperClaude          ║
echo ║                    BYPASS PERMISSION ENABLED                        ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.

:: 관리자 권한 자동 획득
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [AUTO] 관리자 권한 자동 획득 중...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [OK] 관리자 권한 확인
echo.

set "CLAUDE_HOME=%USERPROFILE%\.claude"
set "CLAUDE_JSON=%USERPROFILE%\.claude.json"
set "CLAUDE_SETTINGS=%CLAUDE_HOME%\settings.json"

:: ============================================================================
:: STEP 0: 필수 프로그램 자동 설치
:: ============================================================================
echo ════════════════════════════════════════════════════════════════════════
echo  [AUTO] 필수 프로그램 자동 설치
echo ════════════════════════════════════════════════════════════════════════
echo.

:: Git 설치
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INSTALL] Git 설치 중...
    winget install --id Git.Git -e --source winget --accept-package-agreements --accept-source-agreements --silent >nul 2>&1
    set "PATH=%PATH%;C:\Program Files\Git\cmd"
    echo [OK] Git 설치 완료
) else (
    echo [OK] Git 이미 설치됨
)

:: Node.js 설치
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INSTALL] Node.js LTS 설치 중...
    winget install --id OpenJS.NodeJS.LTS -e --source winget --accept-package-agreements --accept-source-agreements --silent >nul 2>&1
    set "PATH=%PATH%;C:\Program Files\nodejs"
    echo [OK] Node.js 설치 완료
) else (
    echo [OK] Node.js 이미 설치됨
)

:: Python 설치
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INSTALL] Python 3.12 설치 중...
    winget install --id Python.Python.3.12 -e --source winget --accept-package-agreements --accept-source-agreements --silent >nul 2>&1
    echo [OK] Python 설치 완료
) else (
    echo [OK] Python 이미 설치됨
)

:: Claude Code 설치
where claude >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [INSTALL] Claude Code CLI 설치 중...
    call npm install -g @anthropic-ai/claude-code >nul 2>&1
    echo [OK] Claude Code 설치 완료
) else (
    echo [OK] Claude Code 이미 설치됨
)

:: ============================================================================
:: STEP 1: .claude 폴더 생성
:: ============================================================================
if not exist "%CLAUDE_HOME%" mkdir "%CLAUDE_HOME%"
echo [OK] .claude 폴더 준비 완료

:: ============================================================================
:: STEP 2: BYPASS PERMISSION 설정 (핵심!)
:: ============================================================================
echo.
echo ════════════════════════════════════════════════════════════════════════
echo  [CORE] BYPASS PERMISSION 설정
echo ════════════════════════════════════════════════════════════════════════
echo.

(
echo {
echo   "permissions": {
echo     "allow": [
echo       "Bash(*)",
echo       "Read",
echo       "Edit",
echo       "Write",
echo       "Glob",
echo       "Grep",
echo       "WebFetch",
echo       "WebSearch",
echo       "Task",
echo       "TodoWrite",
echo       "NotebookEdit",
echo       "mcp__*"
echo     ],
echo     "deny": []
echo   }
echo }
) > "%CLAUDE_SETTINGS%"

echo [OK] BYPASS PERMISSION 활성화 - 모든 권한 허용

:: ============================================================================
:: STEP 3: 12개 MCP 서버 설정
:: ============================================================================
echo.
echo ════════════════════════════════════════════════════════════════════════
echo  [AUTO] 12개 MCP 서버 설정
echo ════════════════════════════════════════════════════════════════════════
echo.

(
echo {
echo   "mcpServers": {
echo     "brave-search": {
echo       "command": "npx",
echo       "args": ["-y", "@brave/brave-search-mcp-server"],
echo       "env": {
echo         "BRAVE_API_KEY": "${BRAVE_API_KEY}"
echo       }
echo     },
echo     "context7": {
echo       "command": "npx",
echo       "args": ["-y", "@upstash/context7-mcp"]
echo     },
echo     "fetch": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-fetch"]
echo     },
echo     "firebase": {
echo       "command": "npx",
echo       "args": ["-y", "firebase-tools@latest", "mcp"]
echo     },
echo     "gdrive": {
echo       "command": "npx",
echo       "args": ["-y", "@anthropic/gdrive-mcp-server"],
echo       "env": {
echo         "GOOGLE_CLIENT_ID": "${GOOGLE_CLIENT_ID}",
echo         "GOOGLE_CLIENT_SECRET": "${GOOGLE_CLIENT_SECRET}"
echo       }
echo     },
echo     "git": {
echo       "command": "npx",
echo       "args": ["-y", "@anthropic/git-mcp-server"]
echo     },
echo     "github": {
echo       "type": "http",
echo       "url": "https://api.githubcopilot.com/mcp/",
echo       "headers": {
echo         "Authorization": "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}"
echo       }
echo     },
echo     "memory": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-memory"]
echo     },
echo     "pdf": {
echo       "command": "npx",
echo       "args": ["-y", "@sylphx/pdf-reader-mcp"]
echo     },
echo     "playwright": {
echo       "command": "npx",
echo       "args": ["@playwright/mcp@latest"]
echo     },
echo     "sequential-thinking": {
echo       "command": "npx",
echo       "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
echo     },
echo     "supabase": {
echo       "type": "http",
echo       "url": "https://mcp.supabase.com/mcp"
echo     }
echo   }
echo }
) > "%CLAUDE_JSON%"

echo [OK] 12개 MCP 서버 설정 완료
echo.
echo   1. brave-search        6. git              11. sequential-thinking
echo   2. context7            7. github           12. supabase
echo   3. fetch               8. memory
echo   4. firebase            9. pdf
echo   5. gdrive             10. playwright

:: ============================================================================
:: STEP 4: SuperClaude 자동 설치
:: ============================================================================
echo.
echo ════════════════════════════════════════════════════════════════════════
echo  [AUTO] SuperClaude 설치
echo ════════════════════════════════════════════════════════════════════════
echo.

where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    pip install pipx >nul 2>&1
    python -m pipx ensurepath >nul 2>&1
    pipx install superclaude >nul 2>&1
    pipx upgrade superclaude >nul 2>&1
    superclaude install >nul 2>&1
    echo [OK] SuperClaude /sc: 명령어 설치 완료
) else (
    echo [SKIP] Python 미설치 - SuperClaude 건너뜀
)

:: ============================================================================
:: STEP 5: MCP 패키지 사전 캐시 (자동)
:: ============================================================================
echo.
echo ════════════════════════════════════════════════════════════════════════
echo  [AUTO] MCP 패키지 사전 캐시
echo ════════════════════════════════════════════════════════════════════════
echo.

where npx >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [CACHE] context7...
    call npx -y @upstash/context7-mcp --version >nul 2>&1

    echo [CACHE] fetch...
    call npx -y @modelcontextprotocol/server-fetch --version >nul 2>&1

    echo [CACHE] memory...
    call npx -y @modelcontextprotocol/server-memory --version >nul 2>&1

    echo [CACHE] sequential-thinking...
    call npx -y @modelcontextprotocol/server-sequential-thinking --version >nul 2>&1

    echo [CACHE] pdf...
    call npx -y @sylphx/pdf-reader-mcp --version >nul 2>&1

    echo [OK] MCP 패키지 캐시 완료
) else (
    echo [SKIP] npx 미설치 - 캐시 건너뜀
)

:: ============================================================================
:: 완료!
:: ============================================================================
echo.
echo ╔══════════════════════════════════════════════════════════════════════╗
echo ║                    SETUP COMPLETE!                                   ║
echo ╠══════════════════════════════════════════════════════════════════════╣
echo ║  [v] Git                                                             ║
echo ║  [v] Node.js + npm                                                   ║
echo ║  [v] Python + pipx                                                   ║
echo ║  [v] Claude Code CLI                                                 ║
echo ║  [v] 12 MCP Servers                                                  ║
echo ║  [v] SuperClaude /sc: Commands                                       ║
echo ║  [v] BYPASS PERMISSION - ALL ALLOWED                                 ║
echo ╠══════════════════════════════════════════════════════════════════════╣
echo ║                                                                      ║
echo ║  실행: claude                                                        ║
echo ║  SuperClaude: /sc:implement, /sc:analyze, /sc:test ...               ║
echo ║                                                                      ║
echo ╚══════════════════════════════════════════════════════════════════════╝
echo.
echo [AUTO] 3초 후 Claude Code 자동 실행...
timeout /t 3 /nobreak >nul
start cmd /k claude
