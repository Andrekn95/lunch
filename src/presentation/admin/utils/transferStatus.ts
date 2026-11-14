import type { TransactionStatus } from '../../../domain/entities'

export const TRANSFER_STATUS_META: Record<
  TransactionStatus,
  { label: string; badge: string; dot: string }
> = {
  approved: {
    label: 'Abonado',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
  },
  pending: {
    label: 'Por verificar',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
  },
  rejected: {
    label: 'Falla en la transferencia',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-rose-500',
  },
}
