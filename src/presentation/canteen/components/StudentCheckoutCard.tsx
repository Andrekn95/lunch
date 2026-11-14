import {
  CheckCircle2,
  Minus,
  Plus,
  TriangleAlert,
  Wallet,
  X,
} from 'lucide-react'
import type { BalanceStatus } from '../../../domain/value-objects/balance'
import { getBalanceStatus } from '../../../domain/value-objects/balance'
import type { CanteenStudent } from '../data/canteenStudents'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { StudentPhoto } from './StudentPhoto'

const MAX_QUANTITY = 10

const STATUS_STYLES: Record<
  BalanceStatus,
  { label: string; badge: string; dot: string; panel: string }
> = {
  healthy: {
    label: 'Saldo saludable',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-500',
    panel: 'bg-slate-50',
  },
  low: {
    label: 'Saldo bajo',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-500',
    panel: 'bg-amber-50/60 ring-1 ring-inset ring-amber-200',
  },
  empty: {
    label: 'Sin saldo',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
    dot: 'bg-rose-500',
    panel: 'bg-rose-50/60 ring-1 ring-inset ring-rose-200',
  },
}

interface StudentCheckoutCardProps {
  student: CanteenStudent
  quantity: number
  lunchPrice: number
  onChangeQuantity: (quantity: number) => void
  onConfirm: () => void
  onClear: () => void
}

export function StudentCheckoutCard({
  student,
  quantity,
  lunchPrice,
  onChangeQuantity,
  onConfirm,
  onClear,
}: StudentCheckoutCardProps) {
  const status = STATUS_STYLES[getBalanceStatus(student.balance)]
  const total = quantity * lunchPrice
  const insufficient = total > student.balance
  const remainingBalance = Number((student.balance - total).toFixed(2))

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
          Alumno identificado
        </p>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <X className="size-3.5" aria-hidden="true" />
          Cambiar alumno
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4">
        <StudentPhoto
          name={student.name}
          theme={student.photoTheme}
          className="size-20"
        />
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {student.name}
          </h2>
          <p className="text-sm font-medium text-slate-500">
            {student.grade} · {student.accessCode}
          </p>
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${status.badge}`}
          >
            <span className={`size-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>
      </div>

      <div className={`mt-4 flex items-center justify-between gap-3 rounded-2xl p-4 ${status.panel}`}>
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Saldo actual
            </p>
            <p className="text-3xl font-bold tracking-tight text-slate-900">
              {formatCurrency(student.balance)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700">
            Almuerzos a descontar
          </p>
          <span className="text-[11px] font-medium text-slate-400">
            Máx. {MAX_QUANTITY}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onChangeQuantity(quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Quitar un almuerzo"
            className="flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="size-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 flex-col items-center">
            <span className="text-4xl font-bold tracking-tight text-slate-900">
              {quantity}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {quantity === 1 ? 'almuerzo' : 'almuerzos'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onChangeQuantity(quantity + 1)}
            disabled={quantity >= MAX_QUANTITY}
            aria-label="Agregar un almuerzo"
            className="flex size-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-6" aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Precio por almuerzo</dt>
            <dd className="font-medium text-slate-700">
              {formatCurrency(lunchPrice)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Total a descontar</dt>
            <dd className="text-lg font-bold text-slate-900">
              {formatCurrency(total)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-slate-500">Saldo después del cobro</dt>
            <dd
              className={`font-semibold ${
                insufficient ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {formatCurrency(remainingBalance)}
            </dd>
          </div>
        </dl>
      </div>

      {insufficient && (
        <p
          role="alert"
          className="mt-3 flex gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Saldo insuficiente. Faltan{' '}
          {formatCurrency(Number((total - student.balance).toFixed(2)))} para
          cobrar {quantity === 1 ? 'este almuerzo' : 'estos almuerzos'}.
        </p>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={insufficient}
        className="mt-4 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 text-lg font-bold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
      >
        <CheckCircle2 className="size-6" aria-hidden="true" />
        Cobrar / Confirmar descuento
      </button>
      <p className="mt-2 text-center text-[11px] text-slate-400">
        El saldo se descuenta al instante del monedero del estudiante.
      </p>
    </section>
  )
}
