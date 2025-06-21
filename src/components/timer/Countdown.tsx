import { DateTime, Duration } from 'luxon'
import type { Valid } from 'luxon/src/_util'
import { useEffect, useState } from 'react'

const Countdown = (props: Props) => {
  const { onComplete, targetTimestamp } = props

  const [remainingTime, setRemainingTime] = useState<Duration>(calculateRemainingTime(targetTimestamp))

  useEffect(() => {
    const updateRemainingTime = () => {
      const now = DateTime.now()
      const targetTime = DateTime.fromSeconds(targetTimestamp)
      const diff = targetTime.diff(now, ['days', 'hours', 'minutes', 'seconds'])

      if (diff.toMillis() <= 0) {
        setRemainingTime(Duration.fromMillis(0)) // Stop countdown at 0
        if (onComplete) onComplete() // Call onComplete callback (if any)
        return
      }

      setRemainingTime(diff)
    }

    // Initial calculation
    updateRemainingTime()

    // Update every second
    const interval = setInterval(updateRemainingTime, 1000)

    return () => {
      clearInterval(interval)
    } // Clear interval on unmount
  }, [onComplete, targetTimestamp])

  const days = remainingTime.days || 0
  const hours = remainingTime.hours || 0
  const minutes = remainingTime.minutes || 0
  const seconds = Math.floor(remainingTime.seconds || 0)

  return (
    <span>
      {days} days {hours} hours {minutes} minutes {seconds} seconds
    </span>
  )
}

const calculateRemainingTime = (targetTimestamp: number): Duration => {
  const now: DateTime<Valid> = DateTime.now() // Current time
  const targetTime: DateTime<Valid> = DateTime.fromSeconds(targetTimestamp) // Target Unix timestamp
  return targetTime.diff(now, ['days', 'hours', 'minutes', 'seconds'])
}

interface Props {
  targetTimestamp: number
  onComplete?: () => void
}

export default Countdown
