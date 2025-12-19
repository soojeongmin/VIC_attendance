import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import type { TimeSlot } from '../types'

interface ZoneSummary {
  zoneId: string
  zoneName: string
  grade: number
  present: number
  absent: number
  late: number
  other: number
  total: number
  checked: number
  completionRate: number
}

interface StaffStatus {
  staffId: string
  staffName: string
  zones: string[]
  completionRate: number
  lastUpdated: string | null
}

// Mock data - will be replaced with Supabase data
const mockZoneSummaries: ZoneSummary[] = [
  { zoneId: '4A', zoneName: '4층 A구역', grade: 1, present: 28, absent: 1, late: 1, other: 0, total: 30, checked: 30, completionRate: 100 },
  { zoneId: '4B', zoneName: '4층 B구역', grade: 1, present: 25, absent: 2, late: 0, other: 0, total: 30, checked: 27, completionRate: 90 },
  { zoneId: '4C', zoneName: '4층 C구역', grade: 1, present: 0, absent: 0, late: 0, other: 0, total: 30, checked: 0, completionRate: 0 },
  { zoneId: '4D', zoneName: '4층 D구역', grade: 1, present: 30, absent: 0, late: 0, other: 0, total: 30, checked: 30, completionRate: 100 },
  { zoneId: '3A', zoneName: '3층 A구역', grade: 2, present: 29, absent: 1, late: 0, other: 0, total: 30, checked: 30, completionRate: 100 },
  { zoneId: '3B', zoneName: '3층 B구역', grade: 2, present: 15, absent: 0, late: 0, other: 0, total: 30, checked: 15, completionRate: 50 },
]

const mockStaffStatus: StaffStatus[] = [
  { staffId: '1', staffName: '김선생', zones: ['4A', '4B'], completionRate: 95, lastUpdated: '16:55' },
  { staffId: '2', staffName: '이선생', zones: ['4C', '4D'], completionRate: 50, lastUpdated: '16:52' },
  { staffId: '3', staffName: '박선생', zones: ['3A', '3B'], completionRate: 75, lastUpdated: '16:58' },
]

function getCompletionColor(rate: number): string {
  if (rate >= 100) return 'bg-green-500'
  if (rate >= 50) return 'bg-amber-500'
  if (rate > 0) return 'bg-orange-500'
  return 'bg-gray-300'
}

function getCompletionTextColor(rate: number): string {
  if (rate >= 100) return 'text-green-600'
  if (rate >= 50) return 'text-amber-600'
  if (rate > 0) return 'text-orange-600'
  return 'text-gray-500'
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('ET')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [zoneSummaries, _setZoneSummaries] = useState<ZoneSummary[]>(mockZoneSummaries)
  const [staffStatus, _setStaffStatus] = useState<StaffStatus[]>(mockStaffStatus)
  // TODO: Use _setZoneSummaries and _setStaffStatus when fetching from Supabase
  void _setZoneSummaries
  void _setStaffStatus
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null)

  // Filter by grade
  const filteredSummaries = selectedGrade
    ? zoneSummaries.filter((z) => z.grade === selectedGrade)
    : zoneSummaries

  // Calculate overall stats
  const overallStats = filteredSummaries.reduce(
    (acc, zone) => ({
      totalStudents: acc.totalStudents + zone.total,
      totalChecked: acc.totalChecked + zone.checked,
      present: acc.present + zone.present,
      absent: acc.absent + zone.absent,
      late: acc.late + zone.late,
      other: acc.other + zone.other,
    }),
    { totalStudents: 0, totalChecked: 0, present: 0, absent: 0, late: 0, other: 0 }
  )

  const overallCompletionRate = overallStats.totalStudents > 0
    ? Math.round((overallStats.totalChecked / overallStats.totalStudents) * 100)
    : 0

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: Fetch real data from Supabase
      console.log('Refreshing data...')
    }, 30000)
    return () => clearInterval(interval)
  }, [date, timeSlot])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        title="관리자 대시보드"
        showBack
        onBack={() => navigate('/')}
      />

      {/* Filters */}
      <div className="bg-white border-b px-4 py-3 flex flex-wrap gap-3 items-center">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        />
        <div className="flex gap-1">
          {(['ET', 'EP1', 'EP2'] as TimeSlot[]).map((slot) => (
            <button
              key={slot}
              onClick={() => setTimeSlot(slot)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeSlot === slot
                  ? 'bg-slate-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {slot}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <button
            onClick={() => setSelectedGrade(null)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedGrade === null
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            전체
          </button>
          {[1, 2, 3].map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedGrade === grade
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {grade}학년
            </button>
          ))}
        </div>
      </div>

      {/* Overall Summary */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">전체 현황</h2>
            <span className={`text-2xl font-bold ${getCompletionTextColor(overallCompletionRate)}`}>
              {overallCompletionRate}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full ${getCompletionColor(overallCompletionRate)} transition-all duration-500`}
              style={{ width: `${overallCompletionRate}%` }}
            />
          </div>
          <div className="grid grid-cols-5 gap-2 text-center text-sm">
            <div>
              <div className="text-gray-500">전체</div>
              <div className="font-bold text-gray-800">{overallStats.totalStudents}</div>
            </div>
            <div>
              <div className="text-green-600">출석</div>
              <div className="font-bold text-green-600">{overallStats.present}</div>
            </div>
            <div>
              <div className="text-red-600">결석</div>
              <div className="font-bold text-red-600">{overallStats.absent}</div>
            </div>
            <div>
              <div className="text-amber-600">지각</div>
              <div className="font-bold text-amber-600">{overallStats.late}</div>
            </div>
            <div>
              <div className="text-blue-600">기타</div>
              <div className="font-bold text-blue-600">{overallStats.other}</div>
            </div>
          </div>
        </div>

        {/* Zone Status Grid */}
        <h2 className="text-lg font-bold text-gray-800 mb-3">구역별 현황</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {filteredSummaries.map((zone) => (
            <div
              key={zone.zoneId}
              className="bg-white rounded-xl shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/attendance/${zone.zoneId}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-800">{zone.zoneId}</span>
                <span className={`text-sm font-medium ${getCompletionTextColor(zone.completionRate)}`}>
                  {zone.completionRate}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${getCompletionColor(zone.completionRate)}`}
                  style={{ width: `${zone.completionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>확인: {zone.checked}/{zone.total}</span>
                <span className="text-red-500">{zone.absent > 0 && `결석 ${zone.absent}`}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Staff Status */}
        <h2 className="text-lg font-bold text-gray-800 mb-3">담당자별 현황</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">담당자</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">담당 구역</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">완료율</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">최근 업데이트</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffStatus.map((staff) => (
                <tr key={staff.staffId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{staff.staffName}</td>
                  <td className="px-4 py-3 text-gray-600">{staff.zones.join(', ')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getCompletionColor(staff.completionRate)}`}
                          style={{ width: `${staff.completionRate}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${getCompletionTextColor(staff.completionRate)}`}>
                        {staff.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 text-sm">
                    {staff.lastUpdated || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
