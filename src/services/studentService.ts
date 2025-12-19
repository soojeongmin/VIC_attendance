import { supabase } from '../config/supabase'
import type { Database } from '../types/database.types'

type Student = Database['public']['Tables']['students']['Row']
type StudentInsert = Database['public']['Tables']['students']['Insert']

export const studentService = {
  // Get all active students
  async getAll(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('is_active', true)
      .order('grade')
      .order('class_number')
      .order('number_in_class')

    if (error) throw error
    return data || []
  },

  // Get students by zone
  async getByZone(zoneId: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('zone_id', zoneId)
      .eq('is_active', true)
      .order('seat_id')

    if (error) throw error
    return data || []
  },

  // Get students by grade
  async getByGrade(grade: number): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('grade', grade)
      .eq('is_active', true)
      .order('class_number')
      .order('number_in_class')

    if (error) throw error
    return data || []
  },

  // Get single student by ID
  async getById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // Get student by student number
  async getByStudentNumber(studentNumber: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_number', studentNumber)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  // Create new student
  async create(student: StudentInsert): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert(student)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update student
  async update(id: string, updates: Partial<Student>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Bulk create students (for import)
  async bulkCreate(students: StudentInsert[]): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .insert(students)
      .select()

    if (error) throw error
    return data || []
  },

  // Assign student to seat
  async assignSeat(studentId: string, zoneId: string, seatId: string): Promise<Student> {
    return this.update(studentId, { zone_id: zoneId, seat_id: seatId })
  },

  // Deactivate student (soft delete)
  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  },

  // Get students mapped by seat_id for a zone
  async getStudentsBySeatMap(zoneId: string): Promise<Map<string, Student>> {
    const students = await this.getByZone(zoneId)
    const map = new Map<string, Student>()
    students.forEach((student) => {
      if (student.seat_id) {
        map.set(student.seat_id, student)
      }
    })
    return map
  },
}
