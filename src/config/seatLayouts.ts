import type { SeatLayout } from '../types'

// 좌석 배치 (학생 수에 맞게 단순화)
// 1학년 (4층): 4A(32), 4B(32), 4C(32), 4D(31) = 127명
// 2학년 (3층): 3A(35), 3B(35), 3C(22), 3D(48) = 140명

// 좌석 배열 생성 헬퍼 함수
function generateSeats(prefix: string, count: number, seatsPerRow: number = 8): SeatLayout {
  const layout: SeatLayout = []
  let seatNum = 1

  while (seatNum <= count) {
    const row: (string | 'sp' | 'empty' | 'br')[] = []
    for (let i = 0; i < seatsPerRow && seatNum <= count; i++) {
      row.push(`${prefix}${String(seatNum).padStart(3, '0')}`)
      seatNum++
      // 중간에 spacer 추가 (4개씩 끊기)
      if (i === 3 && seatNum <= count && i < seatsPerRow - 1) {
        row.push('sp')
      }
    }
    layout.push(row)
    if (seatNum <= count) {
      layout.push(['br'])
    }
  }

  return layout
}

export const SEAT_LAYOUTS: Record<string, SeatLayout> = {
  // ========== 1학년 (4층) ==========
  '4A': generateSeats('4A', 32, 8),
  '4B': generateSeats('4B', 32, 8),
  '4C': generateSeats('4C', 32, 8),
  '4D': generateSeats('4D', 31, 8),

  // ========== 2학년 (3층) ==========
  '3A': generateSeats('3A', 35, 8),
  '3B': generateSeats('3B', 35, 8),
  '3C': generateSeats('3C', 22, 6),
  '3D': generateSeats('3D', 48, 8),
}
