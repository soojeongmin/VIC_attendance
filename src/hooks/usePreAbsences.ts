// 스프레드시트에서 사전결석/외박 데이터를 로드하는 훅

import { useState, useEffect, useCallback } from 'react'
import { fetchAbsenceData, refreshCache, type AbsenceEntry } from '../services/absenceService'

interface UsePreAbsencesResult {
  entries: AbsenceEntry[]
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  isPreAbsentOnDate: (studentId: string, dateStr: string) => boolean
  getPreAbsenceInfo: (studentId: string, dateStr: string) => {
    reason: string
    type: '사전결석' | '외박'
    startDate: string
    endDate: string
  } | null
}

export function usePreAbsences(): UsePreAbsencesResult {
  const [entries, setEntries] = useState<AbsenceEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('[usePreAbsences] Fetching data...')
      const data = await fetchAbsenceData()
      console.log('[usePreAbsences] Data received:', data)
      setEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'))
      console.error('[usePreAbsences] Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const refresh = useCallback(async () => {
    refreshCache()
    await loadData()
  }, [loadData])

  // 특정 날짜에 사전결석/외박인지 확인
  const isPreAbsentOnDate = useCallback((studentId: string, dateStr: string): boolean => {
    return entries.some(entry =>
      entry.studentId === studentId &&
      dateStr >= entry.startDate &&
      dateStr <= entry.endDate
    )
  }, [entries])

  // 특정 학생의 사전결석 정보 가져오기
  const getPreAbsenceInfo = useCallback((studentId: string, dateStr: string) => {
    const entry = entries.find(e =>
      e.studentId === studentId &&
      dateStr >= e.startDate &&
      dateStr <= e.endDate
    )
    if (!entry) return null
    return {
      reason: entry.reason || '',  // 순수 사유만 반환
      type: entry.type,
      startDate: entry.startDate,
      endDate: entry.endDate
    }
  }, [entries])

  return {
    entries,
    isLoading,
    error,
    refresh,
    isPreAbsentOnDate,
    getPreAbsenceInfo
  }
}
