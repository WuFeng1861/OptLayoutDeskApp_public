/// <reference types="vite/client" />

interface Window {
  ipcRenderer: {
    on: (...args: any[]) => void
    off: (...args: any[]) => void
    send: (...args: any[]) => void
    invoke: (...args: any[]) => void
    openFile: () => Promise<string | null>
  }
}
