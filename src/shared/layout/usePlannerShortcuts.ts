import { useEffect, useEffectEvent } from 'react'

export function usePlannerShortcuts(actions: { undo?: () => void; redo?: () => void; help?: () => void }) {
  const handleKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing || event.repeat || event.altKey) return
    if (
      event.target instanceof Element &&
      event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')
    )
      return
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return

    const key = event.key.toLowerCase()
    const modifier = event.ctrlKey || event.metaKey
    let action: (() => void) | undefined
    if (modifier && key === 'z') action = event.shiftKey ? actions.redo : actions.undo
    if (modifier && key === 'y' && !event.shiftKey) action = actions.redo
    if (!modifier && key === '?') action = actions.help
    if (!action) return
    event.preventDefault()
    action()
  })

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
    }
  }, [])
}
