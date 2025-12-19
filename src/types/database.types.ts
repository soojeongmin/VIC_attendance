export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'other'
export type UserRole = 'admin' | 'teacher' | 'staff'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
      }
      zones: {
        Row: {
          id: string
          grade: number
          zone_id: string
          name: string
          seat_layout: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          grade: number
          zone_id: string
          name: string
          seat_layout: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          grade?: number
          zone_id?: string
          name?: string
          seat_layout?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          student_id: string
          name: string
          hr: string
          parent_phone: string | null
          grade: number
          zone_id: string
          seat_number: string
          email: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          name: string
          hr: string
          parent_phone?: string | null
          grade: number
          zone_id: string
          seat_number: string
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          name?: string
          hr?: string
          parent_phone?: string | null
          grade?: number
          zone_id?: string
          seat_number?: string
          email?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          date: string
          time_slot: string
          status: AttendanceStatus
          note: string | null
          checked_by: string | null
          checked_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          date: string
          time_slot: string
          status?: AttendanceStatus
          note?: string | null
          checked_by?: string | null
          checked_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          date?: string
          time_slot?: string
          status?: AttendanceStatus
          note?: string | null
          checked_by?: string | null
          checked_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      attendance_status: AttendanceStatus
      user_role: UserRole
    }
  }
}
