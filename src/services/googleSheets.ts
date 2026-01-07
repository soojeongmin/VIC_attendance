// Google Sheets API 서비스
// 결석자 데이터를 Google Spreadsheet에 내보내기 (Apps Script 연동)

// Google Apps Script 웹 앱 URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxi0LfvzUXw391lDUFsdNlrknubjyb4sazyLK_92DOVbZUrAMEK7RY8c6gBjzf8celK/exec'

// 스프레드시트 URL (직접 열기용)
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1gVFE9dxJ-tl6f4KFqe5z2XDZ2B5mVgzpFAj7s-XrLAs/edit'

export interface AbsentStudent {
  seatId: string
  name: string
  note: string // 비고 (사전결석 사유 또는 기타 메모)
  grade: number // 1 or 2
}

// 특이사항이 있는 학생 (출석 여부 상관없이)
export interface StudentWithNote {
  seatId: string
  name: string
  note: string
  grade: number
}

export interface ExportResult {
  success: boolean
  message: string
  sheetUrl?: string
}

// 날짜를 시트 이름 형식으로 변환 (YYMMDD)
function formatSheetName(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}${mm}${dd}`
}

// 날짜를 표시 형식으로 변환 (00월 00일(요일))
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const weekday = weekdays[date.getDay()]
  return `${month}월 ${day}일(${weekday})`
}

// Apps Script URL이 설정되었는지 확인
export function isAppsScriptConfigured(): boolean {
  return APPS_SCRIPT_URL.length > 0 && !APPS_SCRIPT_URL.includes('Your_Deployment_ID_Here')
}

// Google Sheets에 직접 내보내기 (Apps Script 사용)
export async function exportToGoogleSheets(
  dateStr: string,
  absentStudents: AbsentStudent[],
  studentsWithNotes?: StudentWithNote[]  // 특이사항 학생 (선택)
): Promise<ExportResult> {
  if (!isAppsScriptConfigured()) {
    return {
      success: false,
      message: 'Apps Script URL이 설정되지 않았습니다. 관리자에게 문의하세요.',
    }
  }

  const sheetName = formatSheetName(dateStr)
  const displayDate = formatDisplayDate(dateStr)
  const grade1Students = absentStudents.filter((s) => s.grade === 1)
  const grade2Students = absentStudents.filter((s) => s.grade === 2)

  // 특이사항 텍스트 생성 (F5부터 시작)
  const notesText = studentsWithNotes && studentsWithNotes.length > 0
    ? studentsWithNotes.map((s) => `${s.seatId} ${s.name}: ${s.note}`).join('\n')
    : ''

  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script는 CORS를 완전히 지원하지 않음
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: dateStr,
        displayDate,
        sheetName,
        grade1Students,
        grade2Students,
        notesText,  // 특이사항 텍스트 추가
      }),
    })

    // no-cors 모드에서는 응답을 읽을 수 없으므로 성공으로 간주
    // 실제 에러는 시트에서 확인
    return {
      success: true,
      message: `${sheetName} 시트로 내보내기 요청 완료 (결석 ${absentStudents.length}명, 특이사항 ${studentsWithNotes?.length || 0}명)`,
      sheetUrl: SPREADSHEET_URL,
    }
  } catch (error) {
    console.error('내보내기 실패:', error)
    return {
      success: false,
      message: `내보내기 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    }
  }
}

// 클립보드로 내보내기 (Google API 키 없이 사용 가능)
export function exportToClipboard(
  dateStr: string,
  absentStudents: AbsentStudent[]
): string {
  const displayDate = formatDisplayDate(dateStr)
  const sheetName = formatSheetName(dateStr)

  const grade1Students = absentStudents.filter((s) => s.grade === 1)
  const grade2Students = absentStudents.filter((s) => s.grade === 2)

  let text = `시트 이름: ${sheetName}\n`
  text += `날짜 (B2): ${displayDate}\n\n`

  text += `=== 1학년 결석자 (B열:좌석, C열:이름, D열:비고) ===\n`
  if (grade1Students.length > 0) {
    grade1Students.forEach((s) => {
      text += `${s.seatId}\t${s.name}\t${s.note}\n`
    })
  } else {
    text += '(없음)\n'
  }

  text += `\n=== 2학년 결석자 (G열:좌석, H열:이름, I열:비고) ===\n`
  if (grade2Students.length > 0) {
    grade2Students.forEach((s) => {
      text += `${s.seatId}\t${s.name}\t${s.note}\n`
    })
  } else {
    text += '(없음)\n'
  }

  return text
}

// 스프레드시트 URL 반환
export function getSpreadsheetUrl(): string {
  return SPREADSHEET_URL
}

// 시트 이름 생성 (외부에서 사용)
export function getSheetName(dateStr: string): string {
  return formatSheetName(dateStr)
}

// 표시용 날짜 생성 (외부에서 사용)
export function getDisplayDate(dateStr: string): string {
  return formatDisplayDate(dateStr)
}
