export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'other'
export type UserRole = 'admin' | 'staff'
export type TimeSlotType = 'ET' | 'EP1' | 'EP2'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: UserRole
          assigned_zones: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: UserRole
          assigned_zones?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: UserRole
          assigned_zones?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      zones: {
        Row: {
          id: string
          name: string
          floor: number
          grade: number
          capacity: number
          seat_layout: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          floor: number
          grade: number
          capacity?: number
          seat_layout?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          floor?: number
          grade?: number
          capacity?: number
          seat_layout?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          student_number: string
          name: string
          grade: number
          class_number: number
          number_in_class: number
          zone_id: string | null
          seat_id: string | null
          parent_phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_number: string
          name: string
          grade: number
          class_number: number
          number_in_class: number
          zone_id?: string | null
          seat_id?: string | null
          parent_phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_number?: string
          name?: string
          grade?: number
          class_number?: number
          number_in_class?: number
          zone_id?: string | null
          seat_id?: string | null
          parent_phone?: string | null
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
          time_slot: TimeSlotType
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
          date?: string
          time_slot: TimeSlotType
          status: AttendanceStatus
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
          time_slot?: TimeSlotType
          status?: AttendanceStatus
          note?: string | null
          checked_by?: string | null
          checked_at?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      attendance_summary: {
        Row: {
          zone_id: string
          zone_name: string
          grade: number
          date: string
          time_slot: TimeSlotType
          present_count: number
          absent_count: number
          late_count: number
          other_count: number
          total_checked: number
          unchecked_count: number
        }
      }
      staff_completion: {
        Row: {
          staff_id: string
          staff_name: string
          assigned_zones: string[]
          date: string
          time_slot: TimeSlotType
          total_students: number
          checked_students: number
          completion_percentage: number
        }
      }
    }
    Enums: {
      attendance_status: AttendanceStatus
      time_slot: TimeSlotType
      user_role: UserRole
    }
  }
}
