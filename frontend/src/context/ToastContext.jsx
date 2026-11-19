import { createContext, useCallback, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

export const ToastContext = createContext(null)

const TOAST_STYLES = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    iconClass: 'text-emerald-600',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-900',
    iconClass: 'text-red-600',
  },
  info: {
    icon: Info,
    className: 'border-coffee-900/10 bg-white text-coffee-900',
    iconClass: 'text-caramel',
  },
}

let toastCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback(
    (type, message) => {
      toastCounter += 1
      const id = toastCounter
      setToasts((current) => [...current, { id, type, message }])
      window.setTimeout(() => dismiss(id), 4500)
    },
    [dismiss],
  )

  const api = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info
          const Icon = style.icon
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex animate-fade-up items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-soft ${style.className}`}
              role="status"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClass}`} />
              <p className="flex-1 leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="rounded-full p-1 opacity-50 transition hover:bg-black/5 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
