# VIC Study Hall Attendance Management System PRD

## 1. Overview

### 1.1 Project Name
VIC Attendance - Study Hall Attendance Management System

### 1.2 Purpose
Digitize high school study hall attendance process to improve staff efficiency and provide automated SMS notifications for absent students/parents.

### 1.3 Background
Current system issues:
- **Inefficient roll call**: Staff calls each name, student raises hand and says "yes" → time-consuming, staff fatigue
- **Slow system**: Google Spreadsheet + Apps Script → poor response time
- **Tedious workflow**: Manual or repetitive clicking

---

## 2. Users & Operations

### 2.1 Target Users
| Role | Description |
|------|-------------|
| Staff | Teachers/employees handling attendance |
| Admin | Student/seat management, system settings |

### 2.2 Daily Schedule
| Time | Activity |
|------|----------|
| 08:20 | Staff picks up tablet |
| 08:30~08:40 | Attendance check (10 min) |
| After 08:40 | Return tablet, send absence SMS |

### 2.3 Study Hall Structure
- **Zones per floor**: 4 zones each floor
- **Seat numbers**: Unique number per seat
- **Student info**: Student ID + Name

---

## 3. Functional Requirements

### 3.1 Core Features (MVP)

#### F1. Seat Map-Based Attendance Check ⭐ (Key Improvement)

Replace roll call with **visual seat map**:
- Display graphical seat layout on screen
- **Default: All present** (green)
- Staff taps empty seats (absent) → turns red
- View entire zone at once
- Expected time: 1-2 min (vs 10 min = 80% reduction)

```
[ Seat Map Example ]
┌────┬────┬────┬────┐
│ 01 │ 02 │ 03 │ 04 │  ← Seat number
│ ✓  │ ✓  │ ✗  │ ✓  │  ← Status (tap to toggle)
├────┼────┼────┼────┤
│ 05 │ 06 │ 07 │ 08 │
│ ✓  │ ✓  │ ✓  │ ✓  │
└────┴────┴────┴────┘
```

#### F2. Attendance Status
| Status | Description | Color |
|--------|-------------|-------|
| Present | Normal attendance | Green |
| Absent | Not present | Red |
| Late | Late arrival (optional) | Yellow |
| Other | Early leave, etc. | Blue |

#### F3. Notes Input
- Text memo per student
- e.g., "Hospital", "Family event", "Overslept"

#### F4. Absence SMS Integration
- Generate absent student list after check
- Integrate with **RiroSchool** for SMS to students/parents
- Manage message templates

### 3.2 Management Features

#### F5. Student Management
- Student CRUD (ID, name, parent phone)
- Assign students to floor/zone
- CSV/Excel bulk upload

#### F6. Seat Management
- Configure seat layout per floor/zone
- Seat-student mapping
- Drag & drop seat editor

#### F7. Attendance Records
- Daily/weekly/monthly attendance view
- Per-student attendance history
- Statistics & reports (attendance rate)

### 3.3 Future Features (Phase 2)

#### F8. QR Code Self-Check (Optional)
- Students scan QR for self check-in
- Staff only verify unchecked students

#### F9. Notifications
- Incomplete check alerts
- Consecutive absence alerts

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **Page load**: Under 2 seconds (improvement over Apps Script)
- **Check response**: Under 200ms
- **Concurrent users**: Minimum 10 (per-floor staff)

### 4.2 Usability
- Tablet-optimized UI (touch-friendly)
- Large buttons, clear color coding
- Offline support (optional): Local save & sync

### 4.3 Security
- Staff login authentication
- Student data privacy (minimal collection)

---

## 5. Tech Stack

### 5.1 Frontend
| Tech | Reason |
|------|--------|
| **React + TypeScript** | Component-based UI, type safety |
| **Tailwind CSS** | Rapid styling, responsive |
| **PWA** | Offline support, app-like experience |

### 5.2 Backend
| Tech | Reason |
|------|--------|
| **Supabase** | PostgreSQL-based, realtime DB, built-in auth |
| **Supabase Auth** | Simple user authentication |
| **Supabase Edge Functions** | Serverless logic (SMS, etc.) |

### 5.3 External Integrations
| Service | Purpose |
|---------|---------|
| **RiroSchool API** | Absence SMS delivery |
| **Google Drive** | Legacy data migration (optional) |

---

## 6. Data Model

### 6.1 Tables

```sql
-- Students
students (
  id UUID PRIMARY KEY,
  student_id VARCHAR(20) UNIQUE,  -- Student number
  name VARCHAR(50),
  parent_phone VARCHAR(20),
  floor INT,
  zone INT,           -- Zone (1~4)
  seat_number INT,
  created_at TIMESTAMP
)

-- Attendance records
attendance (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  date DATE,
  status ENUM('present', 'absent', 'late', 'other'),
  note TEXT,
  checked_by UUID,    -- Staff ID
  checked_at TIMESTAMP
)

-- Users (staff/admin)
users (
  id UUID PRIMARY KEY,
  email VARCHAR(100),
  name VARCHAR(50),
  role ENUM('admin', 'staff'),
  created_at TIMESTAMP
)

-- Zone configuration
zones (
  id UUID PRIMARY KEY,
  floor INT,
  zone_number INT,
  name VARCHAR(50),   -- e.g., "3F Zone A"
  seat_layout JSONB   -- Seat arrangement
)
```

---

## 7. Screens

### 7.1 Main Screens

| Screen | Description |
|--------|-------------|
| Login | Staff authentication |
| Zone Select | Choose floor/zone |
| **Attendance Check** | Seat map + toggle (main screen) |
| Note Input | Per-student memo popup |
| Check Complete | Absent list + SMS button |
| Attendance View | Stats & records (admin) |
| Student Mgmt | Student CRUD (admin) |
| Seat Mgmt | Seat layout editor (admin) |

### 7.2 Attendance Check Wireframe

```
┌─────────────────────────────────────────────┐
│  🏫 3F Zone A          08:32    [Complete]  │
├─────────────────────────────────────────────┤
│                                             │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│   │  01  │ │  02  │ │  03  │ │  04  │      │
│   │ Kim  │ │ Lee  │ │ Park │ │ Choi │      │
│   │  🟢  │ │  🟢  │ │  🔴  │ │  🟢  │      │
│   └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│   │  05  │ │  06  │ │  07  │ │  08  │      │
│   │ Jung │ │ Han  │ │ Jang │ │ Lim  │      │
│   │  🟢  │ │  🟡  │ │  🟢  │ │  🟢  │      │
│   └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
├─────────────────────────────────────────────┤
│  Present: 7 | Absent: 1 | Late: 0          │
│  [All Present] [All Absent] [Add Note]     │
└─────────────────────────────────────────────┘
```

---

## 8. RiroSchool SMS Integration

### 8.1 Integration Method
- RiroSchool API or web automation (TBD)
- Absent list → SMS trigger

### 8.2 Message Template
```
[VIC Study Hall]
{StudentName} was absent from study hall today.
Reason: {Note or "Unconfirmed"}
Contact: 000-0000-0000
```

---

## 9. Milestones

### Phase 1 - MVP
- [ ] Project setup (Supabase, React)
- [ ] DB schema design & creation
- [ ] Login/auth feature
- [ ] Seat map attendance check screen
- [ ] Save attendance records
- [ ] Absent student list screen

### Phase 2 - SMS Integration
- [ ] RiroSchool integration research
- [ ] SMS delivery implementation
- [ ] Message template management

### Phase 3 - Management Features
- [ ] Student CRUD
- [ ] Seat layout editor
- [ ] Attendance stats/reports

### Phase 4 - Enhancement (Optional)
- [ ] QR code self-check
- [ ] Offline support (PWA)
- [ ] Legacy data migration

---

## 10. Open Questions

1. **RiroSchool API**: Official API availability?
2. **Seat layout**: Seats per zone (e.g., 4x5 = 20?)
3. **Student count**: Total students to manage?
4. **Staff count**: Concurrent users?
5. **Legacy data**: Google Spreadsheet migration needed?

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Attendance check time | 10 min → 2 min (80% reduction) |
| System response | Under 2 seconds |
| Staff satisfaction | Improvement over current |
| SMS delivery failures | 0 |

---

*Version: 1.0*
*Date: 2024-12-19*
*Author: Claude Code*
