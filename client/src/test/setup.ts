/// <reference types="vitest/globals" />
import '@testing-library/jest-dom/vitest'

class MockMediaStream {
  getTracks() {
    return [{ stop: () => {} }]
  }
}

Object.defineProperty(globalThis, 'navigator', {
  writable: true,
  value: {
    ...globalThis.navigator,
    mediaDevices: {
      getUserMedia: vi.fn().mockResolvedValue(new MockMediaStream())
    }
  }
})

HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  drawImage: vi.fn()
})) as unknown as typeof HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.toDataURL = vi.fn(
  () => 'data:image/jpeg;base64,mock-frame'
)
