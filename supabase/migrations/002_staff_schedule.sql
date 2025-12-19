-- VIC Attendance System - Staff Schedule Schema
-- For tracking daily staff assignments

-- ============================================
-- Staff Schedule Table
-- ============================================

-- Staff members (simple table for non-authenticated staff)
CREATE TABLE public.staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily staff schedule assignments
CREATE TABLE public.staff_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_date DATE NOT NULL,
    grade INTEGER NOT NULL CHECK (grade IN (1, 2, 3)),
    staff_name_1 TEXT NOT NULL,  -- First assigned staff
    staff_name_2 TEXT NOT NULL,  -- Second assigned staff
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint: one schedule per date per grade
    UNIQUE(schedule_date, grade)
);

-- ============================================
-- Modify Attendance Table
-- ============================================

-- Add staff_name column to track who recorded the attendance
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS staff_name TEXT;

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX idx_staff_schedule_date ON public.staff_schedule(schedule_date);
CREATE INDEX idx_staff_schedule_grade ON public.staff_schedule(grade);
CREATE INDEX idx_attendance_staff ON public.attendance(staff_name);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_schedule ENABLE ROW LEVEL SECURITY;

-- Allow public read for staff schedule (no auth required for MVP)
CREATE POLICY "Anyone can view staff members" ON public.staff_members
    FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view staff schedule" ON public.staff_schedule
    FOR SELECT USING (TRUE);

-- Admins can manage
CREATE POLICY "Admins can manage staff members" ON public.staff_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage staff schedule" ON public.staff_schedule
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- Updated_at Trigger
-- ============================================

CREATE TRIGGER update_staff_schedule_updated_at
    BEFORE UPDATE ON public.staff_schedule
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- View: Today's Staff Assignments
-- ============================================

CREATE OR REPLACE VIEW public.today_staff AS
SELECT
    grade,
    staff_name_1,
    staff_name_2
FROM public.staff_schedule
WHERE schedule_date = CURRENT_DATE;

-- ============================================
-- Sample Data Insert Example (commented out)
-- User will insert actual data via SQL
-- ============================================

/*
-- Example: Insert staff schedule for January 2025
INSERT INTO public.staff_schedule (schedule_date, grade, staff_name_1, staff_name_2) VALUES
    ('2025-01-06', 1, '홍승민', '김솔'),
    ('2025-01-06', 2, '홍선영', '김수진'),
    ('2025-01-07', 1, '조현정', '장보경'),
    ('2025-01-07', 2, '김솔', '김종규');
    -- ... more dates
*/
