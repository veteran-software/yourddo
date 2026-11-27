// @vitest-environment jsdom

import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CraftingSession, createCraftingCatalog } from './craftingSession'

describe('crafting catalog session', () => {
  it('shares pending and completed work across route mounts and retries failures', async () => {
    const initialError = new Error('Catalog unavailable')
    const load = vi.fn<() => Promise<string>>().mockRejectedValueOnce(initialError).mockResolvedValue('catalog')
    const useCatalog = createCraftingCatalog(load)
    const session = {}
    const wrapper = ({ children }: Readonly<{ children: ReactNode }>) => (
      <CraftingSession.Provider value={session}>{children}</CraftingSession.Provider>
    )
    const first = renderHook(useCatalog, { wrapper })
    const pending = first.result.current()
    expect(first.result.current()).toBe(pending)
    await expect(pending).rejects.toBe(initialError)
    const recovered = first.result.current()
    await expect(recovered).resolves.toBe('catalog')
    first.unmount()
    const next = renderHook(useCatalog, { wrapper })
    expect(next.result.current()).toBe(recovered)
    expect(load).toHaveBeenCalledTimes(2)
    next.unmount()
  })
})
