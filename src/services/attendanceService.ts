import { supabase } from '../config/supabase'
import type { Database, AttendanceStatus, TimeSlotType } from '../types/database.types'

type Attendance = Database['public']['Tables']['attendance']['Row']
type AttendanceInsert = Database['public']['Tables']['attendance']['Insert']

export interface AttendanceRecord {
  studentId: string
  status: AttendanceStatus
  note?: string
}

export const attendanceService = {
  // Get attendance for a zone on a specific date and time slot
  async getByZoneAndDate(
    zoneId: string,
    date: string,
    timeSlot: TimeSlotType
  ): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        students!inner(zone_id)
      `)
      .eq('students.zone_id', zoneId)
      .eq('date', date)
      .eq('time_slot', timeSlot)

    if (error) throw error
    return data || []
  },

  // Get attendance for a student
  async getByStudent(
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Attendance[]> {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .order('time_slot')

    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Create or update attendance (upsert)
  async upsert(
    studentId: string,
    date: string,
    timeSlot: TimeSlotType,
    status: AttendanceStatus,
    note?: string,
    checkedBy?: string
  ): Promise<Attendance> {
    const record: AttendanceInsert = {
      student_id: studentId,
      date,
      time_slot: timeSlot,
      status,
      note,
      checked_by: checkedBy,
    }

    const { data, error } = await supabase
      .from('attendance')
      .upsert(record, {
        onConflict: 'student_id,date,time_slot',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Batch upsert attendance records
  async batchUpsert(
    records: AttendanceRecord[],
    date: string,
    timeSlot: TimeSlotType,
    checkedBy?: string
  ): Promise<Attendance[]> {
    const inserts: AttendanceInsert[] = records.map((record) => ({
      student_id: record.studentId,
      date,
      time_slot: timeSlot,
      status: record.status,
      note: record.note,
      checked_by: checkedBy,
    }))

    const { data, error } = await supabase
      .from('attendance')
      .upsert(inserts, {
        onConflict: 'student_id,date,time_slot',
      })
      .select()

    if (error) throw error
    return data || []
  },

  // Mark all students in a zone as present
  async markAllPresent(
    studentIds: string[],
    date: string,
    timeSlot: TimeSlotType,
    checkedBy?: string
  ): Promise<Attendance[]> {
    const records: AttendanceRecord[] = studentIds.map((id) => ({
      studentId: id,
      status: 'present' as AttendanceStatus,
    }))
    return this.batchUpsert(records, date, timeSlot, checkedBy)
  },

  // Get today's date in YYYY-MM-DD format
  getTodayDate(): string {
    const now = new Date()
    return now.toISOString().split('T')[0]
  },

  // Get attendance summary for admin dashboard
  async getSummaryByDate(date: string): Promise<Database['public']['Views']['attendance_summary']['Row'][]> {
    const { data, error } = await supabase
      .from('attendance_summary')
      .select('*')
      .eq('date', date)

    if (error) throw error
    return data || []
  },

  // Get staff completion status
  async getStaffCompletion(date: string): Promise<Database['public']['Views']['staff_completion']['Row'][]> {
    const { data, error } = await supabase
      .from('staff_completion')
      .select('*')
      .eq('date', date)

    if (error) throw error
    return data || []
  },

  // Get attendance map for quick lookup (studentId -> record)
  async getAttendanceMap(
    zoneId: string,
    date: string,
    timeSlot: TimeSlotType
  ): Promise<Map<string, Attendance>> {
    const records = await this.getByZoneAndDate(zoneId, date, timeSlot)
    const map = new Map<string, Attendance>()
    records.forEach((record) => {
      map.set(record.student_id, record)
    })
    return map
  },
}
