import { create } from 'zustand'
import type { AttendanceStatus, TimeSlotType } from '../types/database.types'
import { attendanceService, studentService } from '../services'
import type { Database } from '../types/database.types'

type Student = Database['public']['Tables']['students']['Row']

interface AttendanceRecord {
  studentId: string
  status: AttendanceStatus
  note?: string
  isModified: boolean
}

interface AttendanceState {
  // Current context
  zoneId: string | null
  date: string
  timeSlot: TimeSlotType

  // Data
  students: Map<string, Student>  // seatId -> Student
  records: Map<string, AttendanceRecord>  // studentId -> record

  // UI State
  isLoading: boolean
  isSaving: boolean
  hasChanges: boolean
  error: string | null

  // Actions
  setZone: (zoneId: string) => void
  setDate: (date: string) => void
  setTimeSlot: (timeSlot: TimeSlotType) => void
  loadData: () => Promise<void>
  toggleStatus: (studentId: string) => void
  setStatus: (studentId: string, status: AttendanceStatus, note?: string) => void
  markAllPresent: () => void
  save: () => Promise<void>
  reset: () => void
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  // Initial state
  zoneId: null,
  date: new Date().toISOString().split('T')[0],
  timeSlot: 'ET',
  students: new Map(),
  records: new Map(),
  isLoading: false,
  isSaving: false,
  hasChanges: false,
  error: null,

  setZone: (zoneId) => {
    set({ zoneId, records: new Map(), hasChanges: false })
    get().loadData()
  },

  setDate: (date) => {
    set({ date, records: new Map(), hasChanges: false })
    get().loadData()
  },

  setTimeSlot: (timeSlot) => {
    set({ timeSlot, records: new Map(), hasChanges: false })
    get().loadData()
  },

  loadData: async () => {
    const { zoneId, date, timeSlot } = get()
    if (!zoneId) return

    set({ isLoading: true, error: null })

    try {
      // Load students for this zone
      const studentMap = await studentService.getStudentsBySeatMap(zoneId)

      // Load existing attendance records
      const existingRecords = await attendanceService.getByZoneAndDate(zoneId, date, timeSlot)

      // Convert to our record format
      const records = new Map<string, AttendanceRecord>()
      existingRecords.forEach((record) => {
        records.set(record.student_id, {
          studentId: record.student_id,
          status: record.status,
          note: record.note || undefined,
          isModified: false,
        })
      })

      set({ students: studentMap, records, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load data',
        isLoading: false
      })
    }
  },

  toggleStatus: (studentId) => {
    set((state) => {
      const newRecords = new Map(state.records)
      const current = newRecords.get(studentId)

      // Toggle between present and absent
      const newStatus: AttendanceStatus = current?.status === 'present' ? 'absent' : 'present'

      newRecords.set(studentId, {
        studentId,
        status: newStatus,
        note: current?.note,
        isModified: true,
      })

      return { records: newRecords, hasChanges: true }
    })
  },

  setStatus: (studentId, status, note) => {
    set((state) => {
      const newRecords = new Map(state.records)
      newRecords.set(studentId, {
        studentId,
        status,
        note,
        isModified: true,
      })

      return { records: newRecords, hasChanges: true }
    })
  },

  markAllPresent: () => {
    set((state) => {
      const newRecords = new Map(state.records)

      // Mark all students as present
      state.students.forEach((student) => {
        const existing = newRecords.get(student.id)
        if (!existing || existing.status !== 'present') {
          newRecords.set(student.id, {
            studentId: student.id,
            status: 'present',
            note: existing?.note,
            isModified: true,
          })
        }
      })

      return { records: newRecords, hasChanges: true }
    })
  },

  save: async () => {
    const { records, date, timeSlot, hasChanges } = get()
    if (!hasChanges) return

    set({ isSaving: true, error: null })

    try {
      // Get only modified records
      const modifiedRecords = Array.from(records.values())
        .filter((r) => r.isModified)
        .map((r) => ({
          studentId: r.studentId,
          status: r.status,
          note: r.note,
        }))

      if (modifiedRecords.length > 0) {
        await attendanceService.batchUpsert(modifiedRecords, date, timeSlot)
      }

      // Mark all as not modified
      set((state) => {
        const newRecords = new Map(state.records)
        newRecords.forEach((record, key) => {
          newRecords.set(key, { ...record, isModified: false })
        })
        return { records: newRecords, hasChanges: false, isSaving: false }
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to save',
        isSaving: false,
      })
    }
  },

  reset: () => {
    set({
      zoneId: null,
      records: new Map(),
      students: new Map(),
      hasChanges: false,
      error: null,
    })
  },
}))

// Selectors
export const selectSummary = (state: AttendanceState) => {
  const summary = {
    present: 0,
    absent: 0,
    late: 0,
    other: 0,
    unchecked: 0,
    total: state.students.size,
  }

  state.students.forEach((student) => {
    const record = state.records.get(student.id)
    if (record) {
      summary[record.status]++
    } else {
      summary.unchecked++
    }
  })

  return summary
}
