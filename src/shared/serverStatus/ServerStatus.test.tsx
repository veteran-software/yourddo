// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ServerStatus from './ServerStatus'
import { useServerStatus } from './useServerStatus'

function Dashboard() {
  return <ServerStatus {...useServerStatus()} />
}

const directory = (names: string[]) => `<ArrayOfDatacenterStruct>
  <DatacenterStruct><KeyName>Other</KeyName><Worlds><World><Name>Wrong game</Name></World></Worlds></DatacenterStruct>
  <DatacenterStruct><KeyName>DDO</KeyName><Datacenter><Worlds>${names
    .map(
      (name, i) => `<World><Name>${name}</Name>
  <Order>${String(names.length - i)}</Order><StatusServerUrl>http://gls.ddo.com/status?s=${String(i)}</StatusServerUrl></World>`
    )
    .join('')}</Worlds></Datacenter></DatacenterStruct></ArrayOfDatacenterStruct>`
const publicStatus =
  '<Status><allow_billing_role>TurbineVIP,StormreachStandard,StormreachGuest</allow_billing_role></Status>'
const privateStatus = '<Status><allow_billing_role>TurbineEmployee</allow_billing_role></Status>'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Server status', () => {
  it('orders the DDO worlds, separates preview and legacy, and checks legacy only on demand', async () => {
    const request = vi.fn((path: string) => {
      const feeds: Record<string, string> = {
        '/api/dc': directory(['Thrane [US]', 'Moonsea [EU]', 'Khyber [Old]']),
        '/api-lam/dc': directory(['Lamannia']),
        '/api/status?s=0': privateStatus,
        '/api/status?s=1': publicStatus,
        '/api/status?s=2': privateStatus,
        '/api-lam/status?s=0': publicStatus
      }
      return Promise.resolve(new Response(feeds[path] ?? '<html/>'))
    })
    vi.stubGlobal('fetch', request)
    render(<Dashboard />)
    await screen.findByText('1/2')
    const rows = screen.getAllByRole('listitem')
    expect(rows.map((row) => row.textContent)).toEqual(['MoonseaEUonline', 'ThraneUSoffline', 'LamanniaPreviewonline'])
    expect(request.mock.calls.flat()).not.toContain('/api/status?s=2')
    const toggle = screen.getByRole('button', { name: /Legacy servers/ })
    fireEvent.click(toggle)
    const legacy = within(screen.getByRole('list', { name: 'Legacy servers' }))
    await legacy.findByText('offline')
    expect(legacy.getByText('Khyber')).toBeTruthy()
    expect(toggle.querySelector('.tabler-icon-ghost-2-filled')).toBeTruthy()
    expect(legacy.getByRole('listitem').querySelector('.tabler-icon-ghost-2-filled')).toBeTruthy()
    expect(request.mock.calls.flat()).toContain('/api/status?s=2')
    fireEvent.click(toggle)
    expect(screen.queryByText('Khyber')).toBeNull()
  })

  it('retries after a directory failure and marks unreachable worlds unknown on subsequent checks', async () => {
    vi.useFakeTimers()
    let response = '<html/>'
    let readable = true
    const request = vi.fn((path: string) =>
      Promise.resolve(
        new Response(
          path === '/api/dc'
            ? response
            : path === '/api-lam/dc'
              ? directory(['Lamannia'])
              : path.startsWith('/api-lam/')
                ? privateStatus
                : publicStatus,
          { status: readable || path.includes('dc') ? 200 : 503 }
        )
      )
    )
    vi.stubGlobal('fetch', request)
    const { unmount } = render(<Dashboard />)
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(screen.getByText(/World directory unavailable/)).toBeTruthy()
    response = directory(['Shadowdale [US]'])
    await act(() => vi.advanceTimersByTimeAsync(60000))
    expect(screen.getByText('1/1')).toBeTruthy()
    expect(screen.queryByText('Lamannia')).toBeNull()
    readable = false
    await act(() => vi.advanceTimersByTimeAsync(60000))
    expect(screen.getByText('unknown')).toBeTruthy()
    expect(screen.queryByText('offline')).toBeNull()
    unmount()
    const calls = request.mock.calls.length
    await vi.advanceTimersByTimeAsync(60000)
    expect(request).toHaveBeenCalledTimes(calls)
  })
})
