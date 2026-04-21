import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock any global browser APIs if needed
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})
