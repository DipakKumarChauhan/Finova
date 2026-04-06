import { useEffect, useMemo, useState } from 'react'

export function useProgressiveChartData<T>(
  dataset: T[] | undefined,
  intervalMs = 180,
  initialCount = 1,
) {
  const source = useMemo(() => dataset ?? [], [dataset])
  const [visibleData, setVisibleData] = useState<T[]>([])

  useEffect(() => {
    if (!source.length) {
      setVisibleData((prev) => (prev.length ? [] : prev))
      return
    }

    const firstChunk = Math.min(initialCount, source.length)
    setVisibleData((prev) => {
      if (prev.length === firstChunk) {
        return prev
      }

      return source.slice(0, firstChunk)
    })

    let index = firstChunk
    const timer = setInterval(() => {
      setVisibleData((prev) => {
        if (index >= source.length) {
          clearInterval(timer)
          return prev
        }

        const nextData = source.slice(0, index + 1)
        index += 1
        return nextData
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [source, intervalMs, initialCount])

  return visibleData
}
