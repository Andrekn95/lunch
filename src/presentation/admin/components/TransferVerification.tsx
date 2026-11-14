import { useState } from 'react'
import {
  CheckCircle2,
  FileImage,
  ReceiptText,
  XCircle,
} from 'lucide-react'
import type { AdminTransfer } from '../data/adminDashboardData'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { TRANSFER_STATUS_META } from '../utils/transferStatus'
import { ReceiptPreviewModal } from './ReceiptPreviewModal'

interface TransferVerificationProps {
  transfers: AdminTransfer[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

const LEGEND_STATUSES = ['approved', 'pending', 'rejected'] as const

export function TransferVerification({
  transfers,
  onApprove,
  onReject,
}: TransferVerificationProps) {
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(
    null,
  )

  const selectedTransfer =
    transfers.find((transfer) => transfer.id === selectedTransferId) ?? null

  function closePreview() {
    setSelectedTransferId(null)
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5 sm:p-6">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
              <ReceiptText className="size-4" aria-hidden="true" />
              Control de transferencias
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">
              Pagos reportados por los padres
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Verifica el comprobante antes de liberar el saldo al estudiante.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {transfers.length} transferencias
          </span>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-slate-100 px-5 py-3 sm:px-6">
          {LEGEND_STATUSES.map((status) => {
            const meta = TRANSFER_STATUS_META[status]
            const count = transfers.filter(
              (transfer) => transfer.status === status,
            ).length

            return (
              <span
                key={status}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${meta.badge}`}
              >
                <span className={`size-1.5 rounded-full ${meta.dot}`} />
                {meta.label} · {count}
              </span>
            )
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-semibold sm:px-6">Estudiante</th>
                <th className="px-4 py-3 font-semibold">Padre / Madre</th>
                <th className="px-4 py-3 font-semibold">Monto</th>
                <th className="px-4 py-3 font-semibold">Reportado</th>
                <th className="px-4 py-3 font-semibold">Comprobante</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 text-right font-semibold sm:px-6">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transfers.map((transfer) => {
                const status = TRANSFER_STATUS_META[transfer.status]

                return (
                  <tr
                    key={transfer.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-semibold text-slate-900">
                        {transfer.studentName}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {transfer.parentName}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {formatCurrency(transfer.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {transfer.createdAt}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelectedTransferId(transfer.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        <span className="flex size-7 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                          <FileImage className="size-3.5" aria-hidden="true" />
                        </span>
                        Ver
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${status.badge}`}
                      >
                        <span className={`size-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right sm:px-6">
                      {transfer.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onReject(transfer.id)}
                            aria-label={`Rechazar transferencia de ${transfer.studentName}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                          >
                            <XCircle className="size-3.5" aria-hidden="true" />
                            Rechazar
                          </button>
                          <button
                            type="button"
                            onClick={() => onApprove(transfer.id)}
                            aria-label={`Liberar saldo a ${transfer.studentName}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                          >
                            <CheckCircle2 className="size-3.5" aria-hidden="true" />
                            Liberar saldo
                          </button>
                        </div>
                      ) : transfer.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                          Saldo liberado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500">
                          <XCircle className="size-4" aria-hidden="true" />
                          Comprobante inválido
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {selectedTransfer && (
        <ReceiptPreviewModal
          transfer={selectedTransfer}
          onClose={closePreview}
          onApprove={(id) => {
            onApprove(id)
            closePreview()
          }}
          onReject={(id) => {
            onReject(id)
            closePreview()
          }}
        />
      )}
    </div>
  )
}
