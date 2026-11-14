import {
  CheckCircle2,
  FileText,
  ShieldAlert,
  X,
  XCircle,
} from 'lucide-react'
import type { AdminTransfer } from '../data/adminDashboardData'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { Modal } from '../../shared/Modal'
import { TRANSFER_STATUS_META } from '../utils/transferStatus'

interface ReceiptPreviewModalProps {
  transfer: AdminTransfer
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function ReceiptPreviewModal({
  transfer,
  onClose,
  onApprove,
  onReject,
}: ReceiptPreviewModalProps) {
  const status = TRANSFER_STATUS_META[transfer.status]
  const isPending = transfer.status === 'pending'

  return (
    <Modal
      open
      onClose={onClose}
      titleId="receipt-preview-title"
      maxWidthClassName="max-w-sm"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
              Comprobante de transferencia
            </p>
            <h2
              id="receipt-preview-title"
              className="mt-1 text-lg font-semibold text-slate-900"
            >
              {transfer.studentName}
            </h2>
            <p className="text-sm text-slate-500">{transfer.parentName}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar comprobante"
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{transfer.receipt.bank}</span>
          <span className="font-mono">{transfer.receipt.reference}</span>
        </div>

        <p className="mt-4 text-center text-3xl font-semibold tracking-tight text-slate-900">
          {formatCurrency(transfer.amount)}
        </p>
        <p className="mt-1 text-center text-xs font-medium text-emerald-600">
          Transferencia exitosa
        </p>

        <dl className="mt-5 space-y-2.5 border-t border-dashed border-slate-300 pt-4 text-xs">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-400">Ordenante</dt>
            <dd className="font-medium text-slate-700">
              {transfer.receipt.sender}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-400">Fecha</dt>
            <dd className="font-medium text-slate-700">
              {transfer.receipt.transferredAt}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-400">Reportado</dt>
            <dd className="font-medium text-slate-700">{transfer.createdAt}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-slate-400">Estado</dt>
            <dd>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${status.badge}`}
              >
                <span className={`size-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </dd>
          </div>
        </dl>

        <p className="mt-4 text-center text-[10px] uppercase tracking-[0.18em] text-slate-400">
          Comprobante simulado · Lunch
        </p>
      </div>

      {isPending ? (
        <>
          <div className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800 ring-1 ring-inset ring-amber-200">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              Confirma que el monto y la referencia coincidan con el ingreso en
              la cuenta bancaria antes de liberar el saldo.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => onReject(transfer.id)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <XCircle className="size-4" aria-hidden="true" />
              Rechazar
            </button>
            <button
              type="button"
              onClick={() => onApprove(transfer.id)}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Liberar saldo
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          Cerrar
        </button>
      )}
    </Modal>
  )
}
