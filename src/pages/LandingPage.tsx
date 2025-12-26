import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchTodayStaff, type TodayStaff } from '../config/staffSchedule'

type Step = 'guide' | 'staff-select'

// 전체 담당자 목록
const ALL_STAFF = [
  '김종규', '이건우', '조민경', '노예원', '이예진',
  '홍선영', '장보경', '김솔', '홍승민', '조현정',
  '강현수', '민수정', '박한비', '서률지', '정수빈'
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('guide')
  const [confirmed, setConfirmed] = useState(false)
  const [todayStaff, setTodayStaff] = useState<TodayStaff>({ grade1: null, grade2: null })
  const [loading, setLoading] = useState(true)
  const [selectedGrade, setSelectedGrade] = useState<1 | 2 | null>(null)
  const [showOtherStaff, setShowOtherStaff] = useState(false)

  // Get today's date in Korean format
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  useEffect(() => {
    fetchTodayStaff().then((staff) => {
      setTodayStaff(staff)
      setLoading(false)
    })
  }, [])

  const handleStaffSelect = (staffName: string, grade: number) => {
    // Store selected staff in sessionStorage
    sessionStorage.setItem('currentStaff', JSON.stringify({
      name: staffName,
      grade: grade,
      date: new Date().toISOString().split('T')[0]
    }))

    // Navigate to home page
    navigate('/')
  }

  const getStaffForGrade = (grade: 1 | 2): [string, string] | null => {
    return grade === 1 ? todayStaff.grade1 : todayStaff.grade2
  }

  // Guide screen
  if (step === 'guide') {
    return (
      <div className="min-h-screen bg-white p-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-center text-primary-500 text-2xl font-bold mb-2">
            면학실 출결 체크 안내
          </h1>
          <p className="text-center text-gray-500 mb-6">{today}</p>

          {/* Main guide */}
          <div className="bg-gray-50 p-5 rounded-xl mb-5">
            <h2 className="text-red-600 font-bold text-lg mb-4">출결 체크 방법</h2>

            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-primary-500 font-semibold mb-2">1. 구역 선택</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• 홈 화면에서 담당 구역을 선택합니다</li>
                <li>• 1학년: 4층 (4A, 4B, 4C, 4D)</li>
                <li>• 2학년: 3층 (3A, 3B, 3C, 3D)</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-primary-500 font-semibold mb-2">2. 출결 체크</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• <span className="font-semibold">좌석 터치</span>: 출석 ↔ 결석 토글</li>
                <li>• <span className="bg-green-100 text-green-700 px-1 rounded">초록색</span> = 출석</li>
                <li>• <span className="bg-red-100 text-red-700 px-1 rounded">빨간색</span> = 결석</li>
                <li>• <span className="bg-yellow-50 text-gray-600 px-1 rounded">노란색</span> = 미체크</li>
                <li>• <span className="font-semibold">좌석 꾹 누르기</span>: 학생 정보 확인 (학번, 이름, 좌석 등)</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-primary-500 font-semibold mb-2">3. 빠른 입력 기능</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• <span className="font-semibold text-green-600">전체 출석</span>: 모든 학생을 한번에 출석 처리</li>
                <li>• <span className="font-semibold text-red-600">전체 결석</span>: 모든 학생을 한번에 결석 처리</li>
                <li>• 일부만 결석인 경우: 전체 출석 후 결석자만 터치</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-primary-500 font-semibold mb-2">4. 저장</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• <span className="font-semibold text-primary-600">저장</span>: 출결 데이터 최종 저장 (관리자에게 전송)</li>
                <li>• <span className="font-semibold text-gray-600">임시저장</span>: 중간 저장 (나중에 이어서 작업 가능)</li>
                <li>• 저장 후 덮어쓰기 가능 (수정이 필요한 경우)</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg mb-4">
              <h3 className="text-primary-500 font-semibold mb-2">5. 기타 기능</h3>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• <span className="font-semibold">학생 검색</span>: 홈 화면 우측 상단에서 이름으로 검색</li>
                <li>• <span className="font-semibold">기타사항 입력</span>: 출결 페이지 하단에 메모 작성</li>
                <li>• <span className="font-semibold">버그 보고</span>: 문제 발생 시 홈 화면에서 보고</li>
              </ul>
            </div>
          </div>

          {/* Time info */}
          <div className="bg-blue-50 p-4 rounded-xl mb-5 border border-blue-200">
            <p className="text-center text-blue-800 font-semibold">
              출결 체크 시간: 08:30 ~ 08:50 (20분)
            </p>
          </div>

          {/* Confirm checkbox */}
          <div className="bg-green-50 p-4 rounded-xl mb-5 border border-green-200">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="w-5 h-5 mr-3 accent-green-600"
              />
              <span className="font-semibold text-gray-700">
                위 내용을 모두 읽고 이해했습니다
              </span>
            </label>
          </div>

          {/* Next button */}
          <button
            onClick={() => setStep('staff-select')}
            disabled={!confirmed}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all
              ${confirmed
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            확인하고 시작하기
          </button>
        </div>
      </div>
    )
  }

  // Staff selection screen
  return (
    <div className="min-h-screen bg-white p-5">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-center text-primary-500 text-2xl font-bold mb-2">
          담당자 선택
        </h1>
        <p className="text-center text-gray-500 mb-6">{today}</p>

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            담당자 정보를 불러오는 중...
          </div>
        ) : (
          <>
            {/* Grade selection */}
            {!selectedGrade && (
              <div className="mb-6">
                <p className="text-center text-gray-700 mb-4 font-semibold">
                  담당 학년을 선택하세요
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedGrade(1)}
                    disabled={!todayStaff.grade1}
                    className={`flex-1 py-6 rounded-xl font-bold text-xl transition-all
                      ${todayStaff.grade1
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    1학년
                    {!todayStaff.grade1 && (
                      <p className="text-sm font-normal mt-1">등록된 담당자 없음</p>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedGrade(2)}
                    disabled={!todayStaff.grade2}
                    className={`flex-1 py-6 rounded-xl font-bold text-xl transition-all
                      ${todayStaff.grade2
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    2학년
                    {!todayStaff.grade2 && (
                      <p className="text-sm font-normal mt-1">등록된 담당자 없음</p>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Staff selection for chosen grade */}
            {selectedGrade && (
              <div>
                <button
                  onClick={() => {
                    setSelectedGrade(null)
                    setShowOtherStaff(false)
                  }}
                  className="mb-4 text-gray-500 hover:text-gray-700"
                >
                  ← 학년 다시 선택
                </button>

                <p className="text-center text-gray-700 mb-4 font-semibold">
                  {selectedGrade}학년 담당자를 선택하세요
                </p>

                <div className="space-y-4">
                  {getStaffForGrade(selectedGrade)?.map((staffName, index) => (
                    <button
                      key={index}
                      onClick={() => handleStaffSelect(staffName, selectedGrade)}
                      className={`w-full py-6 rounded-xl font-bold text-xl transition-all
                        ${selectedGrade === 1
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-2 border-blue-300'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 border-2 border-green-300'
                        }`}
                    >
                      {staffName}
                    </button>
                  )) || (
                    <p className="text-center text-gray-500 py-10">
                      오늘 날짜에 등록된 담당자가 없습니다.
                    </p>
                  )}

                  {/* 그 외 버튼 */}
                  <button
                    onClick={() => setShowOtherStaff(!showOtherStaff)}
                    className="w-full py-4 rounded-xl font-semibold text-lg transition-all
                      bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-gray-300"
                  >
                    {showOtherStaff ? '접기 ▲' : '그 외 ▼'}
                  </button>

                  {/* 그 외 담당자 목록 */}
                  {showOtherStaff && (
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl">
                      {ALL_STAFF
                        .filter(name => {
                          const currentStaff = getStaffForGrade(selectedGrade)
                          return !currentStaff?.includes(name)
                        })
                        .map((staffName) => (
                          <button
                            key={staffName}
                            onClick={() => handleStaffSelect(staffName, selectedGrade)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all
                              ${selectedGrade === 1
                                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                              }`}
                          >
                            {staffName}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No staff registered - show full staff list */}
            {!todayStaff.grade1 && !todayStaff.grade2 && !selectedGrade && (
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  오늘 날짜({today})에 등록된 담당자가 없습니다.
                </p>
                <p className="text-gray-700 mb-4 font-semibold">
                  담당 학년을 선택하세요
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setSelectedGrade(1)}
                    className="flex-1 py-6 rounded-xl font-bold text-xl bg-blue-500 text-white hover:bg-blue-600"
                  >
                    1학년
                  </button>
                  <button
                    onClick={() => setSelectedGrade(2)}
                    className="flex-1 py-6 rounded-xl font-bold text-xl bg-green-500 text-white hover:bg-green-600"
                  >
                    2학년
                  </button>
                </div>
              </div>
            )}

            {/* No registered staff but grade selected - show all staff */}
            {!todayStaff.grade1 && !todayStaff.grade2 && selectedGrade && (
              <div>
                <button
                  onClick={() => {
                    setSelectedGrade(null)
                    setShowOtherStaff(false)
                  }}
                  className="mb-4 text-gray-500 hover:text-gray-700"
                >
                  ← 학년 다시 선택
                </button>

                <p className="text-center text-gray-700 mb-4 font-semibold">
                  {selectedGrade}학년 담당자를 선택하세요
                </p>

                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl">
                  {ALL_STAFF.map((staffName) => (
                    <button
                      key={staffName}
                      onClick={() => handleStaffSelect(staffName, selectedGrade)}
                      className={`px-4 py-3 rounded-lg font-medium text-base transition-all
                        ${selectedGrade === 1
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                        }`}
                    >
                      {staffName}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
