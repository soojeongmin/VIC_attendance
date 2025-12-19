import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'

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
    subZones: [
      { id: 'C407', name: 'C407', students: 30 },
      { id: 'C409', name: 'C409', students: 36 },
    ]
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
    subZones: [
      { id: 'C306', name: 'C306', students: 36 },
      { id: 'C307', name: 'C307', students: 36 },
      { id: 'C309', name: 'C309', students: 36 },
    ]
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  const handleZoneClick = (zoneId: string) => {
    navigate(`/attendance/${zoneId}`)
  }

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
