import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cx } from '../../lib/format'
import IconButton from './IconButton'

/** Accessible modal dialog with backdrop. */
export default function Modal({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center">
      <div
        className="animate-fl-fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          'animate-fl-sheet-up relative w-full rounded-t-[24px] bg-surface p-6 shadow-lg sm:animate-fl-rise sm:rounded-[24px] sm:max-w-md',
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-extrabold tracking-tight text-text">{title}</h2>
          <IconButton label="Close" size={32} onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
