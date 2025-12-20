import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from '../components/layout/Header'

interface CurrentStaff {
  name: string
  grade: number
  date: string
}

// Zone configuration based on legacy code
const GRADES = [
  {
    grade: 1,
    name: '1학년 (4층)',
    zones: [
      { id: '4A', name: '4A', color: 'bg-pink-200', students: 146 },
      { id: '4B', name: '4B', color: 'bg-gray-300', students: 61 },
      { id: '4C', name: '4C', color: 'bg-sky-200', students: 53 },
      { id: '4D', name: '4D', color: 'bg-orange-200', students: 120 },
    ],
    
  },
  {
    grade: 2,
    name: '2학년 (3층)',
    zones: [
      { id: '3A', name: '3A', color: 'bg-pink-200', students: 142 },
      { id: '3B', name: '3B', color: 'bg-gray-300', students: 92 },
      { id: '3C', name: '3C', color: 'bg-sky-200', students: 22 },
      { id: '3D', name: '3D', color: 'bg-orange-200', students: 122 },
    ],
    
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [currentStaff, setCurrentStaff] = useState<CurrentStaff | null>(null)

  useEffect(() => {
    // Check for current staff in sessionStorage
    const staffData = sessionStorage.getItem('currentStaff')
    if (staffData) {
      const staff = JSON.parse(staffData) as CurrentStaff
      // Check if it's still today's date
      const today = new Date().toISOString().split('T')[0]
      if (staff.date === today) {
        setCurrentStaff(staff)
      } else {
        // Clear outdated staff data
        sessionStorage.removeItem('currentStaff')
      }
    }
  }, [])

  const handleZoneClick = (zoneId: string) => {
    navigate(`/attendance/${zoneId}`)
  }

  const handleChangeStaff = () => {
    sessionStorage.removeItem('currentStaff')
    navigate('/start')
  }

  // Get today's date in Korean format
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="면학실 선택"
        rightAction={
          <button
            onClick={() => navigate('/admin')}
            className="px-3 py-1 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800"
          >
            관리자
          </button>
        }
      />

      {/* Current staff info bar */}
      <div className="bg-primary-500 text-white px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <span className="text-sm opacity-80">{today}</span>
            {currentStaff ? (
              <p className="font-semibold">
                담당자: {currentStaff.name} ({currentStaff.grade}학년)
              </p>
            ) : (
              <p className="font-semibold text-yellow-200">
                담당자 미선택
              </p>
            )}
          </div>
          <button
            onClick={handleChangeStaff}
            className="px-3 py-1 text-sm bg-white/20 rounded-lg hover:bg-white/30"
          >
            {currentStaff ? '담당자 변경' : '담당자 선택'}
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 space-y-8">
        {GRADES.map((gradeInfo) => (
          <section key={gradeInfo.grade} className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {gradeInfo.name}
            </h2>

            {/* Main zones grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {gradeInfo.zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => handleZoneClick(zone.id)}
                  className={`${zone.color} p-6 rounded-xl border-2 border-gray-300
                             hover:scale-105 hover:shadow-lg transition-all duration-200
                             flex flex-col items-center justify-center min-h-[120px]`}
                >
                  <span className="text-3xl font-bold text-gray-800">{zone.name}</span>
                  <span className="text-sm text-gray-600 mt-2">{zone.students}석</span>
                </button>
              ))}
            </div>

            {/* Sub zones */}
            {gradeInfo.subZones && gradeInfo.subZones.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500 mb-3">기타 교실</p>
                <div className="flex flex-wrap gap-3">
                  {gradeInfo.subZones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneClick(zone.id)}
                      className="px-6 py-3 bg-gray-100 rounded-lg border border-gray-300
                                 hover:bg-gray-200 transition-colors"
                    >
                      <span className="font-semibold">{zone.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({zone.students}석)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </main>
    </div>
  )
}
