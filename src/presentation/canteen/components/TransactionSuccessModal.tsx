import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { Modal } from '../../shared/Modal'
import { formatCurrency } from '../../shared/utils/formatCurrency'

export interface CheckoutSummary {
  studentName: string
  quantity: number
  total: number
  newBalance: number
}

interface TransactionSuccessModalProps {
  summary: CheckoutSummary
  onDone: () => void
}

export function TransactionSuccessModal({
  summary,
  onDone,
}: TransactionSuccessModalProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onDone, 900)
    return () => window.clearTimeout(timeout)
  }, [onDone])

  return (
    <Modal
      open
      onClose={onDone}
      titleId="checkout-success-title"
      maxWidthClassName="max-w-sm"
    >
      <div className="text-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
        >
          <Check className="size-9" strokeWidth={3} aria-hidden="true" />
        </motion.span>

        <h2
          id="checkout-success-title"
          className="mt-4 text-xl font-bold text-slate-900"
        >
          Cobro registrado
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">
          Se {summary.quantity === 1 ? 'ha' : 'han'} descontado{' '}
          <span className="font-semibold text-slate-900">
            {summary.quantity} {summary.quantity === 1 ? 'almuerzo' : 'almuerzos'}
          </span>{' '}
          a <span className="font-semibold text-slate-900">{summary.studentName}</span>.
        </p>

        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-inset ring-emerald-200">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            Nuevo saldo
          </p>
          <p className="text-3xl font-bold tracking-tight text-emerald-800">
            {formatCurrency(summary.newBalance)}
          </p>
        </div>

        <p className="mt-2 text-xs text-slate-400">
          Total descontado: {formatCurrency(summary.total)}
        </p>

        <button
          type="button"
          onClick={onDone}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          Siguiente alumno
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </Modal>
  )
}
