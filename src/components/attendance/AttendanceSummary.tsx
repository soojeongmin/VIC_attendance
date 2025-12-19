interface AttendanceSummaryProps {
  present: number
  absent: number
  late: number
  other: number
  unchecked: number
  total: number
}

export default function AttendanceSummary({
  present,
  absent,
  late,
  other,
  unchecked,
}: AttendanceSummaryProps) {
  const items = [
    { label: '출석', count: present, color: 'text-green-600', bg: 'bg-green-100' },
    { label: '결석', count: absent, color: 'text-red-600', bg: 'bg-red-100' },
    { label: '지각', count: late, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: '기타', count: other, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: '미체크', count: unchecked, color: 'text-gray-600', bg: 'bg-gray-100' },
  ]

  return (
    <div className="bg-white border-b px-4 py-3">
      <div className="flex gap-3 overflow-x-auto">
        {items.map((item) => (
          <div
            key={item.label}
            className={`${item.bg} px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap`}
          >
            <span className={`font-semibold ${item.color}`}>{item.label}</span>
            <span className={`font-bold text-lg ${item.color}`}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
