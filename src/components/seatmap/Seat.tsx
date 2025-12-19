import { memo } from 'react'

interface SeatProps {
  seatId: string
  studentName?: string
  studentId?: string
  isAssigned: boolean  // Whether a student is assigned to this seat
  status: 'present' | 'absent' | 'late' | 'other' | 'unchecked'
  hasNote?: boolean
  onClick: () => void
}

const statusClasses: Record<string, string> = {
  present: 'bg-green-100 border-green-500 text-green-800',
  absent: 'bg-red-100 border-red-500 text-red-800',
  late: 'bg-amber-100 border-amber-500 text-amber-800',
  other: 'bg-blue-100 border-blue-500 text-blue-800',
  unchecked: 'bg-yellow-50 border-gray-300 text-gray-600',
  unassigned: 'bg-gray-100 border-gray-300 text-gray-400',
}

const statusLabels: Record<string, string> = {
  present: '출석',
  absent: '결석',
  late: '지각',
  other: '기타',
  unchecked: '미체크',
}

function Seat({ seatId, studentName, studentId, isAssigned, status, hasNote, onClick }: SeatProps) {
  // Unassigned seat styling
  if (!isAssigned) {
    return (
      <div
        className={`
          seat mx-0.5 relative
          ${statusClasses.unassigned}
          border-2 rounded-lg
          cursor-default
          flex flex-col items-center justify-center
        `}
      >
        <span className="text-[0.5rem] font-medium text-gray-400">{seatId}</span>
        <span className="text-[0.5rem] font-medium text-gray-400">미배정</span>
      </div>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`
        seat mx-0.5 relative
        ${statusClasses[status]}
        border-2 rounded-lg
        hover:scale-105 active:scale-95
        transition-transform duration-100
        flex flex-col items-center justify-center
      `}
    >
      {/* Student ID */}
      <span className="font-bold text-[0.55rem] leading-tight">
        {studentId || seatId}
      </span>

      {/* Student Name */}
      <span className="text-[0.55rem] leading-tight truncate max-w-full px-0.5 font-medium">
        {studentName || ''}
      </span>

      {/* Status Label */}
      <span className={`text-[0.5rem] leading-tight font-semibold mt-0.5
        ${status === 'present' ? 'text-green-600' : ''}
        ${status === 'absent' ? 'text-red-600' : ''}
        ${status === 'late' ? 'text-amber-600' : ''}
        ${status === 'other' ? 'text-blue-600' : ''}
        ${status === 'unchecked' ? 'text-gray-400' : ''}
      `}>
        {statusLabels[status]}
      </span>

      {/* Note indicator */}
      {hasNote && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
      )}
    </button>
  )
}

export default memo(Seat)
