import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import SeatMap from '../components/seatmap/SeatMap'
import AttendanceSummary from '../components/attendance/AttendanceSummary'
import type { AttendanceRecord, CurrentStaff } from '../types'
import { SEAT_LAYOUTS } from '../config/seatLayouts'
import { getStudentBySeatId } from '../config/mockStudents'

export default function AttendancePage() {
  const { zoneId } = useParams<{ zoneId: string }>()
  const navigate = useNavigate()
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map())
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentStaff, setCurrentStaff] = useState<CurrentStaff | null>(null)

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

  // Get today's date in Korean format
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  const handleSeatClick = (seatId: string) => {
    setAttendanceRecords((prev) => {
      const newRecords = new Map(prev)
      const current = newRecords.get(seatId)

      // Toggle between present and absent
      const newStatus = current?.status === 'present' ? 'absent' : 'present'
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

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Implement save to Supabase with staff_name
    // The records already contain staffName from handleSeatClick
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
    setHasChanges(false)
    alert(`출결이 저장되었습니다.${currentStaff ? `\n기록자: ${currentStaff.name}` : ''}`)
  }

  const handleMarkAllPresent = () => {
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

  // Calculate summary
  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    other: 0,
    unchecked: 0,
    total: 0,
  }

  attendanceRecords.forEach((record) => {
    if (record.status !== 'unchecked') {
      summary[record.status]++
    }
    summary.total++
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        title={`${zoneId}`}
        showBack
        onBack={() => navigate('/')}
      />

      {/* Date and staff display */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-semibold text-gray-700">{today}</span>
            <span className="ml-2 text-sm text-gray-500">출결 체크</span>
          </div>
          {currentStaff ? (
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

      {/* Summary bar */}
      <AttendanceSummary {...summary} />

      {/* Seat map */}
      <div className="flex-1 overflow-auto p-4">
        <SeatMap
          zoneId={zoneId || ''}
          attendanceRecords={attendanceRecords}
          onSeatClick={handleSeatClick}
        />
      </div>

      {/* Action bar */}
      <div className="bg-white border-t p-4 flex gap-3">
        <button
          onClick={handleMarkAllPresent}
          className="flex-1 py-3 bg-green-100 text-green-700 font-semibold rounded-xl
                     hover:bg-green-200 transition-colors"
        >
          전체 출석
        </button>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="flex-1 py-3 bg-primary-500 text-white font-semibold rounded-xl
                     hover:bg-primary-600 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
