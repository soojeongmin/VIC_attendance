import { memo } from 'react'

interface SeatProps {
  seatId: string
  studentName?: string
  studentId?: string
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
}

function Seat({ seatId, studentName, status, hasNote, onClick }: SeatProps) {
  return (
    <button
      onClick={onClick}
      className={`
        seat mx-0.5 relative
        ${statusClasses[status]}
        border-2 rounded-lg
        hover:scale-105 active:scale-95
        transition-transform duration-100
      `}
    >
      <span className="font-bold text-[0.65rem] leading-tight">{seatId}</span>
      <span className="text-[0.6rem] leading-tight truncate max-w-full px-1">
        {studentName || ''}
      </span>

      {/* Note indicator */}
      {hasNote && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
      )}
    </button>
  )
}

export default memo(Seat)
