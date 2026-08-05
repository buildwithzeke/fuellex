import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cx } from '../../lib/format'

/** Mobile bottom sheet — .sheet + .sheet-handle from the mockup. */
export default function BottomSheet({ open, onClose, children, className }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-x-0 bottom-0 z-[9999] sm:hidden">
      <div
        className="animate-fl-fade-in absolute inset-0 -z-10 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          'animate-fl-sheet-up max-h-[75vh] overflow-y-auto rounded-t-[24px] border-t border-border bg-surface p-4 pb-8 shadow-[0_-8px_30px_rgba(15,23,42,.15)]',
          className
        )}
      >
        <div className="mx-auto mb-3 h-[5px] w-11 rounded-full bg-border" />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-text-3 transition-colors hover:text-text"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
