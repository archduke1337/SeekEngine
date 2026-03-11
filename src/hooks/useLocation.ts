import { useEffect, useState } from 'react'

/**
 * useLocation — Shared hook for IP-based location and time-of-day detection.
 * Used by LocationGreeting and ResultsFooter to avoid duplicated logic.
 */
export function useLocation() {
  const [location, setLocation] = useState<string>('your world')
  const [timeOfDay, setTimeOfDay] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours()
      if (hour < 12) setTimeOfDay('morning')
      else if (hour < 18) setTimeOfDay('afternoon')
      else setTimeOfDay('evening')
    }

    updateTime()
    const timeInterval = setInterval(updateTime, 60_000)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1200)

    fetch('https://ipapi.co/json/', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId)
        if (controller.signal.aborted) return
        if (data.city) setLocation(data.city)
        else if (data.region) setLocation(data.region)
      })
      .catch(() => {
        clearTimeout(timeoutId)
      })

    return () => {
      clearInterval(timeInterval)
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  return { location, timeOfDay }
}
