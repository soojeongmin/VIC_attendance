import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface HeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  rightAction?: ReactNode
}

export default function Header({ title, showBack, onBack, rightAction }: HeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header className="bg-slate-700 text-white px-4 py-3 sticky top-0 z-50 shadow-lg">
      <div className="flex items-center gap-4">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-slate-600 rounded-lg transition-colors"
            aria-label="뒤로가기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
        )}

        <h1 className="text-xl font-bold flex-1">{title}</h1>

        {rightAction ? (
          <div>{rightAction}</div>
        ) : (
          <div className="text-sm text-gray-300">
            {new Date().toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </div>
        )}
      </div>
    </header>
  )
}
