import type { TimeSlot } from '../../types'

interface TimeSlotSelectorProps {
  value: TimeSlot
  onChange: (slot: TimeSlot) => void
}

const timeSlots: TimeSlot[] = ['ET', 'EP1', 'EP2']

export default function TimeSlotSelector({ value, onChange }: TimeSlotSelectorProps) {
  return (
    <div className="flex gap-2">
      {timeSlots.map((slot) => (
        <button
          key={slot}
          onClick={() => onChange(slot)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            value === slot
              ? 'bg-slate-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  )
}
