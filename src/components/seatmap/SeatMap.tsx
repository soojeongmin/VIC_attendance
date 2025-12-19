import { useMemo } from 'react'
import Seat from './Seat'
import type { AttendanceRecord } from '../../types'
import { SEAT_LAYOUTS } from '../../config/seatLayouts'

interface SeatMapProps {
  zoneId: string
  attendanceRecords: Map<string, AttendanceRecord>
  onSeatClick: (seatId: string, studentId: string) => void
}

// Mock student data - will be replaced with Supabase data
const mockStudentMap: Record<string, { name: string; studentId: string }> = {}

export default function SeatMap({
  zoneId,
  attendanceRecords,
  onSeatClick,
}: SeatMapProps) {
  const layout = useMemo(() => {
    return SEAT_LAYOUTS[zoneId] || []
  }, [zoneId])

  if (layout.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        좌석 배치 정보를 불러오는 중...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 overflow-x-auto">
      <div className="min-w-max">
        {layout.map((row, rowIndex) => {
          // Handle line break
          if (row[0] === 'br') {
            return <div key={`br-${rowIndex}`} className="h-6" />
          }

          return (
            <div key={rowIndex} className="flex mb-2">
              {row.map((cell, cellIndex) => {
                // Handle spacer
                if (cell === 'sp') {
                  return <div key={`sp-${cellIndex}`} className="seat-spacer" />
                }

                // Handle empty seat
                if (cell === 'empty') {
                  return <div key={`empty-${cellIndex}`} className="seat seat-empty" />
                }

                // Regular seat
                const seatId = cell as string
                const student = mockStudentMap[seatId]
                const record = student ? attendanceRecords.get(student.studentId) : undefined

                return (
                  <Seat
                    key={seatId}
                    seatId={seatId}
                    studentName={student?.name}
                    studentId={student?.studentId}
                    status={record?.status || 'unchecked'}
                    hasNote={!!record?.note}
                    onClick={() => {
                      if (student) {
                        onSeatClick(seatId, student.studentId)
                      }
                    }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
