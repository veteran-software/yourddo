import { DateTime, Duration } from 'luxon'
import type { Valid } from 'luxon/src/_util'
import { useEffect, useState } from 'react'

const Countdown = (props: Props) => {
  const { onComplete, targetTimestamp } = props

  const [remainingTime, setRemainingTime] = useState<Duration>(calculateRemainingTime(targetTimestamp))

  useEffect(() => {
    const updateRemainingTime = () => {
      const now: DateTime<Valid> = DateTime.now()
      const targetTime: DateTime<Valid> = DateTime.fromSeconds(targetTimestamp)
      const diff: Duration<Valid> = targetTime.diff(now, ['days', 'hours', 'minutes', 'seconds'])

      if (diff.toMillis() <= 0) {
        setRemainingTime(Duration.fromMillis(0))
        if (onComplete) onComplete()
        return
      }

      setRemainingTime(diff)
    }

    updateRemainingTime()

    const interval = setInterval(updateRemainingTime, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [onComplete, targetTimestamp])

  const days: number = remainingTime.days
  const hours: number = remainingTime.hours
  const minutes: number = remainingTime.minutes
  const seconds: number = Math.floor(remainingTime.seconds)

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
