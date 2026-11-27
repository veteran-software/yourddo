import { useEffect, useEffectEvent, useState } from 'react'

export const unsavedPlannerMessage =
  'Changes could not be saved in this browser. Retry saving or download a backup before leaving.'

export function usePlannerAutosave<T>(value: T | null, save: (value: T) => boolean) {
  const [saveFailed, setSaveFailed] = useState(false)
  const persist = useEffectEvent((snapshot: T) => {
    setSaveFailed(!save(snapshot))
  })
  useEffect(() => {
    if (value !== null) persist(value)
  }, [value])

  useEffect(() => {
    if (!saveFailed) return
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    const onLink = (event: MouseEvent) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (
        !(link instanceof HTMLAnchorElement) ||
        (link.target && link.target !== '_self') ||
        link.hasAttribute('download')
      )
        return
      const url = new URL(link.href)
      if (url.origin !== location.origin || url.pathname === location.pathname) return
      if (!window.confirm(unsavedPlannerMessage + ' Leave this planner?')) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    window.addEventListener('beforeunload', beforeUnload)
    document.addEventListener('click', onLink, true)
    return () => {
      window.removeEventListener('beforeunload', beforeUnload)
      document.removeEventListener('click', onLink, true)
    }
  }, [saveFailed])

  return {
    saveFailed,
    retrySave: () => {
      if (value !== null) setSaveFailed(!save(value))
    }
  }
}
