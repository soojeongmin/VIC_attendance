-- VIC Attendance System - Initial Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- ENUM Types
-- ============================================

CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'other');
CREATE TYPE time_slot AS ENUM ('ET', 'EP1', 'EP2');
CREATE TYPE user_role AS ENUM ('staff', 'admin');

-- ============================================
-- Tables
-- ============================================

-- Staff/Admin users (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    assigned_zones TEXT[] DEFAULT '{}',  -- Array of zone IDs this staff can manage
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Zones (floors and areas)
CREATE TABLE public.zones (
    id TEXT PRIMARY KEY,  -- e.g., '4A', '3B', 'C407'
    name TEXT NOT NULL,   -- Display name e.g., '4층 A구역'
    floor INTEGER NOT NULL,
    grade INTEGER NOT NULL,  -- 1, 2, or 3
    capacity INTEGER NOT NULL DEFAULT 0,
    seat_layout JSONB,  -- Optional: override default layout
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Students
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_number TEXT NOT NULL UNIQUE,  -- 학번 e.g., '10101'
    name TEXT NOT NULL,
    grade INTEGER NOT NULL,  -- 1, 2, or 3
    class_number INTEGER NOT NULL,  -- 반
    number_in_class INTEGER NOT NULL,  -- 번호
    zone_id TEXT REFERENCES public.zones(id),
    seat_id TEXT,  -- Seat position in the zone e.g., '4A101'
    parent_phone TEXT,  -- For SMS notifications
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Attendance records
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time_slot time_slot NOT NULL,
    status attendance_status NOT NULL,
    note TEXT,
    checked_by UUID REFERENCES public.profiles(id),
    checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint: one record per student per date per time slot
    UNIQUE(student_id, date, time_slot)
);

-- ============================================
-- Indexes
-- ============================================

-- Students indexes
CREATE INDEX idx_students_zone ON public.students(zone_id);
CREATE INDEX idx_students_grade ON public.students(grade);
CREATE INDEX idx_students_seat ON public.students(seat_id);
CREATE INDEX idx_students_active ON public.students(is_active) WHERE is_active = TRUE;

-- Attendance indexes
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_student ON public.attendance(student_id);
CREATE INDEX idx_attendance_date_slot ON public.attendance(date, time_slot);
CREATE INDEX idx_attendance_zone_date ON public.attendance(date, time_slot)
    INCLUDE (student_id, status);

-- Zones indexes
CREATE INDEX idx_zones_grade ON public.zones(grade);
CREATE INDEX idx_zones_floor ON public.zones(floor);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Zones policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view zones" ON public.zones
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admins can manage zones" ON public.zones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Students policies
CREATE POLICY "Authenticated users can view students" ON public.students
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Staff can view students in assigned zones" ON public.students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND (role = 'admin' OR zone_id = ANY(assigned_zones))
        )
    );

CREATE POLICY "Admins can manage students" ON public.students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Attendance policies
CREATE POLICY "Staff can view attendance for assigned zones" ON public.attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.students s ON s.id = student_id
            WHERE p.id = auth.uid()
            AND (p.role = 'admin' OR s.zone_id = ANY(p.assigned_zones))
        )
    );

CREATE POLICY "Staff can insert attendance for assigned zones" ON public.attendance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.students s ON s.id = student_id
            WHERE p.id = auth.uid()
            AND (p.role = 'admin' OR s.zone_id = ANY(p.assigned_zones))
        )
    );

CREATE POLICY "Staff can update attendance for assigned zones" ON public.attendance
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            JOIN public.students s ON s.id = student_id
            WHERE p.id = auth.uid()
            AND (p.role = 'admin' OR s.zone_id = ANY(p.assigned_zones))
        )
    );

CREATE POLICY "Admins can manage all attendance" ON public.attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- Functions
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_zones_updated_at
    BEFORE UPDATE ON public.zones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'staff'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Views for Admin Dashboard
-- ============================================

-- Attendance summary by zone and date
CREATE OR REPLACE VIEW public.attendance_summary AS
SELECT
    z.id AS zone_id,
    z.name AS zone_name,
    z.grade,
    a.date,
    a.time_slot,
    COUNT(*) FILTER (WHERE a.status = 'present') AS present_count,
    COUNT(*) FILTER (WHERE a.status = 'absent') AS absent_count,
    COUNT(*) FILTER (WHERE a.status = 'late') AS late_count,
    COUNT(*) FILTER (WHERE a.status = 'other') AS other_count,
    COUNT(*) AS total_checked,
    z.capacity - COUNT(*) AS unchecked_count
FROM public.zones z
LEFT JOIN public.students s ON s.zone_id = z.id AND s.is_active = TRUE
LEFT JOIN public.attendance a ON a.student_id = s.id
GROUP BY z.id, z.name, z.grade, a.date, a.time_slot;

-- Staff completion status
CREATE OR REPLACE VIEW public.staff_completion AS
SELECT
    p.id AS staff_id,
    p.name AS staff_name,
    p.assigned_zones,
    a.date,
    a.time_slot,
    COUNT(DISTINCT s.id) AS total_students,
    COUNT(DISTINCT a.student_id) AS checked_students,
    CASE
        WHEN COUNT(DISTINCT s.id) = 0 THEN 100
        ELSE ROUND((COUNT(DISTINCT a.student_id)::NUMERIC / COUNT(DISTINCT s.id)) * 100, 1)
    END AS completion_percentage
FROM public.profiles p
CROSS JOIN (SELECT DISTINCT date, time_slot FROM public.attendance) a
LEFT JOIN public.students s ON s.zone_id = ANY(p.assigned_zones) AND s.is_active = TRUE
LEFT JOIN public.attendance att ON att.student_id = s.id
    AND att.date = a.date
    AND att.time_slot = a.time_slot
WHERE p.role = 'staff'
GROUP BY p.id, p.name, p.assigned_zones, a.date, a.time_slot;

-- ============================================
-- Seed Data for Zones
-- ============================================

-- Grade 1 (4th floor)
INSERT INTO public.zones (id, name, floor, grade, capacity) VALUES
    ('4A', '4층 A구역', 4, 1, 30),
    ('4B', '4층 B구역', 4, 1, 30),
    ('4C', '4층 C구역', 4, 1, 30),
    ('4D', '4층 D구역', 4, 1, 30),
    ('C407', 'C407 강의실', 4, 1, 20),
    ('C409', 'C409 강의실', 4, 1, 20);

-- Grade 2 (3rd floor)
INSERT INTO public.zones (id, name, floor, grade, capacity) VALUES
    ('3A', '3층 A구역', 3, 2, 30),
    ('3B', '3층 B구역', 3, 2, 30),
    ('3C', '3층 C구역', 3, 2, 30),
    ('3D', '3층 D구역', 3, 2, 30),
    ('C306', 'C306 강의실', 3, 2, 20),
    ('C307', 'C307 강의실', 3, 2, 20),
    ('C309', 'C309 강의실', 3, 2, 20);

-- Grade 3 zones (to be added when layout is provided)
-- INSERT INTO public.zones (id, name, floor, grade, capacity) VALUES
--     ('2A', '2층 A구역', 2, 3, 30),
--     ...
