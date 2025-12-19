// Mock student data for testing
// 80% of seats have students, 20% are unassigned

import { SEAT_LAYOUTS } from './seatLayouts'

export interface MockStudent {
  studentId: string  // 5-digit student number
  name: string
  seatId: string
}

// Korean surnames and given names for generating random names
const SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍']
const GIVEN_NAMES = ['민준', '서준', '도윤', '예준', '시우', '하준', '주원', '지호', '지후', '준서', '서연', '서윤', '지우', '서현', '민서', '하은', '하윤', '윤서', '지민', '채원', '수빈', '지원', '다은', '은서', '예은', '수아', '지아', '소율', '예린', '시은']

// Generate a random Korean name
function generateRandomName(): string {
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)]
  const givenName = GIVEN_NAMES[Math.floor(Math.random() * GIVEN_NAMES.length)]
  return surname + givenName
}

// Generate a 5-digit student ID based on grade, class, and number
function generateStudentId(grade: number, classNum: number, studentNum: number): string {
  return `${grade}${String(classNum).padStart(2, '0')}${String(studentNum).padStart(2, '0')}`
}

// Seed for reproducible random (simple seeded random)
let seed = 12345
function seededRandom(): number {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}

// Get all seat IDs from a zone
function getAllSeatIds(zoneId: string): string[] {
  const layout = SEAT_LAYOUTS[zoneId]
  if (!layout) return []

  const seatIds: string[] = []
  layout.forEach(row => {
    if (row[0] === 'br') return
    row.forEach(cell => {
      if (cell !== 'sp' && cell !== 'empty' && cell !== 'br') {
        seatIds.push(cell as string)
      }
    })
  })
  return seatIds
}

// Generate mock students for all zones
function generateMockStudents(): Map<string, MockStudent | null> {
  const studentMap = new Map<string, MockStudent | null>()

  // Grade 1 zones (4th floor)
  const grade1Zones = ['4A', '4B', '4C', '4D', 'C407', 'C409']
  // Grade 2 zones (3rd floor)
  const grade2Zones = ['3A', '3B', '3C', '3D', 'C306', 'C307', 'C309']

  let studentCounter = 1

  // Process Grade 1
  grade1Zones.forEach((zoneId, zoneIndex) => {
    const seatIds = getAllSeatIds(zoneId)
    seatIds.forEach((seatId) => {
      // 80% chance of having a student
      if (seededRandom() < 0.80) {
        const classNum = (zoneIndex % 10) + 1
        const studentId = generateStudentId(1, classNum, studentCounter % 40 + 1)
        studentMap.set(seatId, {
          studentId,
          name: generateRandomName(),
          seatId,
        })
        studentCounter++
      } else {
        // Unassigned seat
        studentMap.set(seatId, null)
      }
    })
  })

  // Process Grade 2
  studentCounter = 1
  grade2Zones.forEach((zoneId, zoneIndex) => {
    const seatIds = getAllSeatIds(zoneId)
    seatIds.forEach((seatId) => {
      // 80% chance of having a student
      if (seededRandom() < 0.80) {
        const classNum = (zoneIndex % 10) + 1
        const studentId = generateStudentId(2, classNum, studentCounter % 40 + 1)
        studentMap.set(seatId, {
          studentId,
          name: generateRandomName(),
          seatId,
        })
        studentCounter++
      } else {
        // Unassigned seat
        studentMap.set(seatId, null)
      }
    })
  })

  return studentMap
}

// Export the generated mock student data
export const MOCK_STUDENTS = generateMockStudents()

// Helper function to get student by seat ID
export function getStudentBySeatId(seatId: string): MockStudent | null {
  return MOCK_STUDENTS.get(seatId) ?? null
}
