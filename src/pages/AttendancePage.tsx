import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import Header from '../components/layout/Header'
import SeatMap from '../components/seatmap/SeatMap'
import PinchZoomContainer from '../components/PinchZoomContainer'
import type { AttendanceRecord, CurrentStaff } from '../types'
import { SEAT_LAYOUTS } from '../config/seatLayouts'
import { getStudentBySeatId } from '../config/mockStudents'
import { usePreAbsences } from '../hooks/usePreAbsences'
import { getTodayKST } from '../utils/date'
import { zoneAttendanceService } from '../services/zoneAttendanceService'

interface StudentModalData {
  studentName: string
  studentId: string
  seatId: string
  preAbsenceInfo?: {
    reason: string
    type: '사전결석' | '외박'
    startDate: string
    endDate: string
  } | null
  note: string
}

// 학생 특이사항 저장/불러오기 함수
function getStudentNote(seatId: string, dateKey: string): string {
  const notes = localStorage.getItem(`student_notes_${dateKey}`)
  if (notes) {
    try {
      const parsed = JSON.parse(notes) as Record<string, string>
      return parsed[seatId] || ''
    } catch {
      return ''
    }
  }
  return ''
}

function saveStudentNote(seatId: string, dateKey: string, note: string) {
  const notesKey = `student_notes_${dateKey}`
  const existingNotes = localStorage.getItem(notesKey)
  let notes: Record<string, string> = {}
  if (existingNotes) {
    try {
      notes = JSON.parse(existingNotes)
    } catch {
      notes = {}
    }
  }
  if (note.trim()) {
    notes[seatId] = note.trim()
  } else {
    delete notes[seatId]
  }
  localStorage.setItem(notesKey, JSON.stringify(notes))
}

function getAllStudentNotes(dateKey: string): Record<string, string> {
  const notes = localStorage.getItem(`student_notes_${dateKey}`)
  if (notes) {
    try {
      return JSON.parse(notes) as Record<string, string>
    } catch {
      return {}
    }
  }
  return {}
}

export default function AttendancePage() {
  const { zoneId } = useParams<{ zoneId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as {
    fromAdmin?: boolean
    recordedBy?: string
    viewDate?: string
    viewData?: [string, AttendanceRecord][]
  } | null
  const fromAdmin = locationState?.fromAdmin
  const adminRecordedBy = locationState?.recordedBy
  const viewDate = locationState?.viewDate
  const viewData = locationState?.viewData
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map())
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<CurrentStaff | null>(null)
  const [studentModal, setStudentModal] = useState<StudentModalData | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [alertModal, setAlertModal] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null)
  const [hasTempSave, setHasTempSave] = useState(false)
  const [studentNotes, setStudentNotes] = useState<Record<string, string>>({})
  const [preAbsenceProcessed, setPreAbsenceProcessed] = useState(false)
  const [supabaseRecordedBy, setSupabaseRecordedBy] = useState<string | null>(null)
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(true)

  // 스프레드시트에서 사전결석/외박 데이터 로드
  const { entries: preAbsenceEntries, getPreAbsenceInfo, isLoading: preAbsenceLoading } = usePreAbsences()

  // 오늘 날짜 키 (한국 시간 기준)
  const todayKey = getTodayKST()
  const dateKey = viewDate || todayKey

  // localStorage 키
  const getTempSaveKey = () => `attendance_temp_${zoneId}_${todayKey}`
  const getSavedKey = () => `attendance_saved_${zoneId}_${todayKey}`

  // 배정된 좌석 목록 계산
  const assignedSeats = useMemo(() => {
    const layout = SEAT_LAYOUTS[zoneId || '']
    if (!layout) return []

    const seats: string[] = []
    layout.forEach((row) => {
      if (row[0] === 'br') return
      row.forEach((cell) => {
        if (cell !== 'sp' && cell !== 'empty' && cell !== 'br') {
          const seatId = cell as string
          const student = getStudentBySeatId(seatId)
          if (student) {
            seats.push(seatId)
          }
        }
      })
    })
    return seats
  }, [zoneId])

  // Get current staff from sessionStorage
  useEffect(() => {
    const staffData = sessionStorage.getItem('currentStaff')
    if (staffData) {
      const staff = JSON.parse(staffData) as CurrentStaff
      const today = new Date().toISOString().split('T')[0]
      if (staff.date === today) {
        setCurrentStaff(staff)
      }
    }
  }, [])

  // 학생 특이사항 불러오기
  useEffect(() => {
    setStudentNotes(getAllStudentNotes(dateKey))
  }, [dateKey])

  // Supabase에서 데이터 로드 및 실시간 구독
  useEffect(() => {
    if (!zoneId) return

    // 관리자에서 특정 날짜 데이터를 보러 온 경우 - Supabase에서 notes도 로드
    if (fromAdmin && viewDate && viewData) {
      const loadAdminView = async () => {
        try {
          const restoredRecords = new Map(viewData)
          setAttendanceRecords(restoredRecords)
          setHasTempSave(false)
          setHasChanges(false)
          setPreAbsenceProcessed(true)

          // Supabase에서 notes 로드
          const supabaseData = await zoneAttendanceService.get(zoneId, viewDate)
          if (supabaseData?.notes) {
            setStudentNotes(supabaseData.notes)
          }
        } catch (e) {
          console.error('조회 데이터 복원 실패:', e)
        } finally {
          setIsLoadingSupabase(false)
        }
      }
      loadAdminView()
      return
    }

    const loadData = async () => {
      setIsLoadingSupabase(true)

      // 1. 먼저 내 임시저장 데이터 확인 (작업 중이던 것)
      const tempData = localStorage.getItem(getTempSaveKey())
      if (tempData) {
        try {
          const parsed = JSON.parse(tempData) as [string, AttendanceRecord][]
          const restoredRecords = new Map(parsed)
          setAttendanceRecords(restoredRecords)
          setHasTempSave(true)
          setHasChanges(true)
          setPreAbsenceProcessed(true)
          setIsLoadingSupabase(false)
          console.log('[AttendancePage] Restored from temp save')
          return
        } catch (e) {
          console.error('임시저장 데이터 복원 실패:', e)
        }
      }

      // 2. Supabase에서 데이터 확인 (다른 담당자가 저장한 것 포함)
      try {
        const supabaseData = await zoneAttendanceService.get(zoneId, todayKey)
        if (supabaseData) {
          console.log('[AttendancePage] Loaded from Supabase:', supabaseData.recorded_by)
          const records = new Map<string, AttendanceRecord>(supabaseData.data)
          setAttendanceRecords(records)
          setSupabaseRecordedBy(supabaseData.recorded_by || null)
          setHasTempSave(false)
          setHasChanges(false)
          setPreAbsenceProcessed(true)

          // Supabase 특이사항도 로드
          if (supabaseData.notes) {
            setStudentNotes(supabaseData.notes)
          }

          // localStorage에도 백업
          localStorage.setItem(`attendance_saved_${zoneId}_${todayKey}`, JSON.stringify(Array.from(records.entries())))
          if (supabaseData.recorded_by) {
            localStorage.setItem(`attendance_recorder_${zoneId}_${todayKey}`, supabaseData.recorded_by)
          }

          setIsLoadingSupabase(false)
          return
        }
      } catch (err) {
        console.error('[AttendancePage] Supabase load error:', err)
      }

      // 3. Supabase 실패 시 localStorage 확인
      const savedDataKey = `attendance_saved_${zoneId}_${todayKey}`
      const savedData = localStorage.getItem(savedDataKey)
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData) as [string, AttendanceRecord][]
          const restoredRecords = new Map(parsed)
          setAttendanceRecords(restoredRecords)
          const recorder = localStorage.getItem(`attendance_recorder_${zoneId}_${todayKey}`)
          setSupabaseRecordedBy(recorder)
          setHasTempSave(false)
          setHasChanges(false)
          setPreAbsenceProcessed(true)
          setIsLoadingSupabase(false)
          return
        } catch (e) {
          console.error('저장된 데이터 복원 실패:', e)
        }
      }

      // 4. 아무 데이터도 없으면 사전결석 처리 대기
      setPreAbsenceProcessed(false)
      setIsLoadingSupabase(false)
    }

    loadData()

    // 실시간 구독 설정
    const unsubscribe = zoneAttendanceService.subscribeToDate(todayKey, (allZoneData) => {
      // 현재 구역의 데이터만 확인
      const myZoneData = allZoneData.find(d => d.zone_id === zoneId)
      if (myZoneData && !hasChanges) {
        // 내가 수정 중이 아닐 때만 업데이트
        console.log('[AttendancePage] Realtime update for zone:', zoneId)
        const records = new Map<string, AttendanceRecord>(myZoneData.data)
        setAttendanceRecords(records)
        setSupabaseRecordedBy(myZoneData.recorded_by || null)
        if (myZoneData.notes) {
          setStudentNotes(myZoneData.notes)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [zoneId, todayKey, fromAdmin, viewDate, viewData, hasChanges])

  // 사전 결석 학생 자동 결석 처리 (스프레드시트 데이터 로드 후)
  useEffect(() => {
    // 이미 처리됨, 로딩 중, 또는 조회 모드면 스킵
    if (preAbsenceProcessed || preAbsenceLoading || viewDate) return

    // 로딩 완료 후 직접 entries를 사용하여 사전결석 학생 체크
    const preAbsenceRecords = new Map<string, AttendanceRecord>()
    assignedSeats.forEach((seatId) => {
      const student = getStudentBySeatId(seatId)
      if (!student) return

      // 오늘 날짜에 사전결석인지 직접 entries에서 확인
      const hasPreAbsence = preAbsenceEntries.some(entry =>
        entry.studentId === student.studentId &&
        todayKey >= entry.startDate &&
        todayKey <= entry.endDate
      )

      if (hasPreAbsence) {
        preAbsenceRecords.set(seatId, {
          studentId: seatId,
          status: 'absent',
          isModified: true,
          staffName: currentStaff?.name,
        })
      }
    })

    if (preAbsenceRecords.size > 0) {
      setAttendanceRecords(preAbsenceRecords)
      setHasChanges(true)
    }
    setPreAbsenceProcessed(true)
  }, [preAbsenceProcessed, preAbsenceLoading, preAbsenceEntries, viewDate, assignedSeats, todayKey, currentStaff])

  // Get display date in Korean format (viewDate when from admin, otherwise today)
  const displayDate = useMemo(() => {
    const dateToShow = viewDate ? new Date(viewDate + 'T00:00:00') : new Date()
    return dateToShow.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
  }, [viewDate])

  const handleSeatClick = (seatId: string) => {
    // 조회 모드에서는 클릭해도 변경 불가
    if (viewDate) return

    setAttendanceRecords((prev) => {
      const newRecords = new Map(prev)
      const current = newRecords.get(seatId)

      // 출석 → 결석 → 미체크 순환
      let newStatus: 'present' | 'absent' | 'unchecked'
      if (!current || current.status === 'unchecked') {
        newStatus = 'present'
      } else if (current.status === 'present') {
        newStatus = 'absent'
      } else {
        // 결석 상태에서 다시 누르면 미체크로 (기록 삭제)
        newRecords.delete(seatId)
        return newRecords
      }

      newRecords.set(seatId, {
        studentId: seatId,
        status: newStatus,
        isModified: true,
        staffName: currentStaff?.name,
      })

      return newRecords
    })
    setHasChanges(true)
  }

  const handleSeatLongPress = (seatId: string) => {
    const student = getStudentBySeatId(seatId)
    if (student) {
      const note = getStudentNote(seatId, dateKey)
      // 현재 날짜에 사전결석/외박인 경우 정보 가져오기
      const info = getPreAbsenceInfo(student.studentId, dateKey)
      setStudentModal({
        studentName: student.name,
        studentId: student.studentId,
        seatId: seatId,
        preAbsenceInfo: info,
        note: note,
      })
      setNoteInput(note)
    }
  }

  const handleSaveNote = () => {
    if (studentModal) {
      saveStudentNote(studentModal.seatId, dateKey, noteInput)
      setStudentNotes(getAllStudentNotes(dateKey))
      setStudentModal(null)
      setNoteInput('')
    }
  }

  // 임시저장
  const handleTempSave = () => {
    const dataToSave = Array.from(attendanceRecords.entries())
    localStorage.setItem(getTempSaveKey(), JSON.stringify(dataToSave))
    setHasTempSave(true)
    setAlertModal({
      title: '임시 저장 완료',
      message: '출결 데이터가 로컬에 임시 저장되었습니다.\n인터넷 연결이 복구되면 저장 버튼을 눌러주세요.',
    })
  }

  // 실제 저장 실행
  const executeSave = async () => {
    setIsSaving(true)

    try {
      // Supabase에 저장 (실시간 동기화)
      await zoneAttendanceService.save(
        zoneId || '',
        todayKey,
        attendanceRecords,
        currentStaff?.name,
        studentNotes
      )
      console.log('[AttendancePage] Saved to Supabase')
    } catch (err) {
      console.error('[AttendancePage] Supabase save error:', err)
      // Supabase 저장 실패해도 localStorage에는 저장
    }

    // localStorage에도 백업 저장
    const dataToSave = Array.from(attendanceRecords.entries())
    localStorage.setItem(getSavedKey(), JSON.stringify(dataToSave))
    // 저장 시간 기록
    localStorage.setItem(`attendance_saved_time_${zoneId}_${todayKey}`, new Date().toISOString())
    // 기록자 이름 저장
    if (currentStaff?.name) {
      localStorage.setItem(`attendance_recorder_${zoneId}_${todayKey}`, currentStaff.name)
    }
    // 임시저장 데이터 삭제
    localStorage.removeItem(getTempSaveKey())

    setIsSaving(false)
    setHasChanges(false)
    setHasTempSave(false)
    setAlertModal({
      title: '저장 완료',
      message: `출결이 저장되었습니다.${currentStaff ? `\n기록자: ${currentStaff.name}` : ''}\n(서버에 실시간 동기화됨)`,
    })
  }

  const handleSave = async () => {
    // 미체크 학생 확인
    if (summary.unchecked > 0) {
      setAlertModal({
        title: '저장 불가',
        message: `미체크 학생이 ${summary.unchecked}명 있습니다.\n모든 학생의 출결 체크를 완료해주세요.`,
      })
      return
    }

    // 이미 오늘 저장된 기록이 있는지 확인
    const savedTimeStr = localStorage.getItem(`attendance_saved_time_${zoneId}_${todayKey}`)
    const hasSavedData = localStorage.getItem(getSavedKey())
    if (hasSavedData && savedTimeStr) {
      const savedDate = new Date(savedTimeStr)
      const timeStr = savedDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
      setAlertModal({
        title: '덮어쓰기 확인',
        message: `오늘 ${timeStr}에 이미 저장된 기록이 있습니다.\n덮어쓰시겠습니까?`,
        onConfirm: executeSave,
      })
      return
    }

    await executeSave()
  }

  const handleMarkAllPresent = () => {
    if (viewDate) return // 조회 모드에서는 변경 불가

    const layout = SEAT_LAYOUTS[zoneId || '']
    if (!layout) return

    const newRecords = new Map<string, AttendanceRecord>()

    layout.forEach((row) => {
      if (row[0] === 'br') return

      row.forEach((cell) => {
        if (cell !== 'sp' && cell !== 'empty' && cell !== 'br') {
          const seatId = cell as string
          // Only mark assigned seats as present
          const student = getStudentBySeatId(seatId)
          if (student) {
            newRecords.set(seatId, {
              studentId: seatId,
              status: 'present',
              isModified: true,
              staffName: currentStaff?.name,
            })
          }
        }
      })
    })

    setAttendanceRecords(newRecords)
    setHasChanges(true)
  }

  const handleMarkAllAbsent = () => {
    if (viewDate) return // 조회 모드에서는 변경 불가

    const layout = SEAT_LAYOUTS[zoneId || '']
    if (!layout) return

    const newRecords = new Map<string, AttendanceRecord>()

    layout.forEach((row) => {
      if (row[0] === 'br') return

      row.forEach((cell) => {
        if (cell !== 'sp' && cell !== 'empty' && cell !== 'br') {
          const seatId = cell as string
          // Only mark assigned seats as absent
          const student = getStudentBySeatId(seatId)
          if (student) {
            newRecords.set(seatId, {
              studentId: seatId,
              status: 'absent',
              isModified: true,
              staffName: currentStaff?.name,
            })
          }
        }
      })
    })

    setAttendanceRecords(newRecords)
    setHasChanges(true)
  }

  // Calculate summary (배정된 학생만 카운트)
  const summary = useMemo(() => {
    let present = 0
    let absent = 0

    // 배정된 좌석에 대해서만 출결 카운트
    assignedSeats.forEach((seatId) => {
      const record = attendanceRecords.get(seatId)
      if (record) {
        if (record.status === 'present') present++
        else if (record.status === 'absent') absent++
      }
    })

    const unchecked = assignedSeats.length - present - absent

    return { present, absent, unchecked, total: assignedSeats.length }
  }, [attendanceRecords, assignedSeats])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        title={`${zoneId}`}
        showBack
        onBack={() => navigate(fromAdmin ? '/admin' : '/')}
      />

      {/* Date, summary and staff display */}
      <div className={`border-b px-4 py-3 ${viewDate ? 'bg-purple-50' : 'bg-white'}`}>
        <div className="flex justify-between items-center">
          <div>
            <span className={`text-lg font-semibold ${viewDate ? 'text-purple-700' : 'text-gray-700'}`}>{displayDate}</span>
            <span className="ml-2 text-sm text-gray-500">
              {viewDate ? '(조회 모드)' : '출결 체크'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Summary counts */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-600 font-medium">출석 {summary.present}</span>
              <span className="text-gray-300">|</span>
              <span className="text-red-600 font-medium">결석 {summary.absent}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 font-medium">미체크 {summary.unchecked}</span>
            </div>
            {/* Staff info */}
            {fromAdmin && adminRecordedBy ? (
              <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                기록자: {adminRecordedBy}
              </span>
            ) : supabaseRecordedBy && !hasChanges ? (
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                저장됨: {supabaseRecordedBy}
              </span>
            ) : currentStaff ? (
              <span className="text-sm bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
                기록자: {currentStaff.name}
              </span>
            ) : (
              <span className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
                담당자 미선택
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons - 조회 모드에서는 숨김 */}
      {!viewDate && (
        <div className="bg-white border-b px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="flex-1 py-2 bg-green-100 text-green-700 font-semibold rounded-lg
                         hover:bg-green-200 transition-colors text-sm"
            >
              일괄 출석
            </button>
            <button
              onClick={handleMarkAllAbsent}
              className="flex-1 py-2 bg-red-100 text-red-700 font-semibold rounded-lg
                         hover:bg-red-200 transition-colors text-sm"
            >
              일괄 결석
            </button>
            <button
              onClick={handleTempSave}
              disabled={!hasChanges || isSaving}
              className="flex-1 py-2 bg-yellow-100 text-yellow-700 font-semibold rounded-lg
                         hover:bg-yellow-200 transition-colors text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasTempSave ? '임시저장됨' : '임시저장'}
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex-1 py-2 bg-primary-500 text-white font-semibold rounded-lg
                         hover:bg-primary-600 transition-colors text-sm
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      )}

      {/* Seat map */}
      <div className="flex-1 overflow-hidden p-4">
        {isLoadingSupabase ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <div className="text-gray-500 text-sm">데이터 불러오는 중...</div>
            </div>
          </div>
        ) : (
          <PinchZoomContainer>
            <SeatMap
              zoneId={zoneId || ''}
              attendanceRecords={attendanceRecords}
              studentNotes={studentNotes}
              dateKey={dateKey}
              preAbsenceEntries={preAbsenceEntries}
              onSeatClick={handleSeatClick}
              onSeatLongPress={handleSeatLongPress}
            />
          </PinchZoomContainer>
        )}
      </div>

      {/* 알림 모달 */}
      {alertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-5">
              <h2 className="text-xl font-bold mb-3">{alertModal.title}</h2>
              <p className="text-gray-600 whitespace-pre-line">{alertModal.message}</p>
            </div>
            <div className="p-4 border-t flex gap-3">
              {alertModal.onConfirm ? (
                <>
                  <button
                    onClick={() => setAlertModal(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl
                               hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => {
                      alertModal.onConfirm?.()
                      setAlertModal(null)
                    }}
                    className="flex-1 py-3 bg-primary-500 text-white font-semibold rounded-xl
                               hover:bg-primary-600 transition-colors"
                  >
                    확인
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setAlertModal(null)}
                  className="flex-1 py-3 bg-primary-500 text-white font-semibold rounded-xl
                             hover:bg-primary-600 transition-colors"
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 학생 정보 모달 */}
      {studentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
            <div className="bg-blue-500 text-white p-4">
              <h2 className="text-xl font-bold">학생 정보</h2>
            </div>
            <div className="p-5 space-y-4">
              {/* 학생 기본 정보 */}
              <div>
                <div className="text-gray-500 text-sm">학생 정보</div>
                <div className="font-bold text-lg">
                  {studentModal.studentName} ({studentModal.studentId})
                </div>
                <div className="text-gray-600">좌석: {studentModal.seatId}</div>
              </div>

              {/* 사전 결석/외박 정보 (있는 경우) */}
              {studentModal.preAbsenceInfo && (
                <div className={`p-4 rounded-xl border-2 ${
                  studentModal.preAbsenceInfo.type === '외박'
                    ? 'bg-indigo-50 border-indigo-300'
                    : 'bg-purple-50 border-purple-300'
                }`}>
                  <div className={`text-sm font-semibold mb-1 ${
                    studentModal.preAbsenceInfo.type === '외박'
                      ? 'text-indigo-600'
                      : 'text-purple-600'
                  }`}>
                    {studentModal.preAbsenceInfo.type === '외박' ? '외박 신청' : '사전 결석 신청'}
                  </div>
                  <div className={`font-medium ${
                    studentModal.preAbsenceInfo.type === '외박'
                      ? 'text-indigo-800'
                      : 'text-purple-800'
                  }`}>
                    {studentModal.preAbsenceInfo.reason || (studentModal.preAbsenceInfo.type === '외박' ? '외박' : '사전 결석')}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    기간: {studentModal.preAbsenceInfo.startDate} ~ {studentModal.preAbsenceInfo.endDate}
                  </div>
                </div>
              )}

              {/* 특이사항 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  특이사항
                </label>
                <textarea
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="학생에 대한 특이사항을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500"
                  rows={3}
                  disabled={!!viewDate}
                />
              </div>
            </div>
            <div className="p-4 border-t flex gap-2">
              <button
                onClick={() => {
                  setStudentModal(null)
                  setNoteInput('')
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl
                           hover:bg-gray-200 transition-colors"
              >
                {viewDate ? '닫기' : '취소'}
              </button>
              {!viewDate && (
                <button
                  onClick={handleSaveNote}
                  className="flex-1 py-3 bg-blue-500 text-white font-semibold rounded-xl
                             hover:bg-blue-600 transition-colors"
                >
                  저장
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
