import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { cx } from '../lib/format'
import { CheckCircle2, XCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

const STYLES = {
  success: {
    icon: CheckCircle2,
    iconClass: 'bg-success-soft text-success',
  },
  error: {
    icon: XCircle,
    iconClass: 'bg-danger-soft text-danger',
  },
  info: {
    icon: Info,
    iconClass: 'bg-primary-soft text-primary',
  },
}

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const push = useCallback(
    (type, message) => {
      const id = nextId++
      setToasts((prev) => [...prev.slice(-3), { id, type, message }])
      timers.current[id] = setTimeout(() => dismiss(id), 4000)
    },
    [dismiss]
  )

  const toast = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[1000] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((t) => {
          const style = STYLES[t.type] || STYLES.info
          const Icon = style.icon
          return (
            <div
              key={t.id}
              role="status"
              className="animate-fl-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-[14px] border border-border bg-surface px-4 py-3 shadow-lg"
            >
              <span
                className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-lg', style.iconClass)}
              >
                <Icon size={16} strokeWidth={2.5} />
              </span>
              <p className="flex-1 text-[13px] font-semibold text-text">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-text-3 transition-colors hover:text-text"
                aria-label="Dismiss"
              >
                <XCircle size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
