import { useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import {
  Check,
  Clock3,
  Copy,
  FileText,
  Info,
  Landmark,
  Upload,
} from 'lucide-react'
import type { BankAccount } from '../data/parentPortalData'
import { formatCurrency } from '../../shared/utils/formatCurrency'

const QUICK_AMOUNTS = [10, 20, 30]

interface SubmittedRequest {
  amount: number
  fileName: string
  submittedAt: string
}

interface RechargeSectionProps {
  bankAccount: BankAccount
}

export function RechargeSection({ bankAccount }: RechargeSectionProps) {
  const [amount, setAmount] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<SubmittedRequest | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const bankRows = [
    { key: 'bank', label: 'Banco', value: bankAccount.bank },
    {
      key: 'accountType',
      label: 'Tipo de cuenta',
      value: bankAccount.accountType,
    },
    {
      key: 'accountNumber',
      label: 'Número de cuenta',
      value: bankAccount.accountNumber,
    },
    { key: 'holder', label: 'Titular', value: bankAccount.holder },
    {
      key: 'documentId',
      label: 'Cédula / RUC',
      value: bankAccount.documentId,
    },
  ]

  async function handleCopy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current))
      }, 1800)
    } catch {
      setCopiedKey(null)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null
    setProof(selectedFile)
    if (selectedFile) setError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Ingresa un monto válido mayor a 0.')
      return
    }

    if (!proof) {
      setError('Adjunta el comprobante de la transferencia.')
      return
    }

    setError(null)
    setSubmitted({
      amount: parsedAmount,
      fileName: proof.name,
      submittedAt: new Date().toLocaleString('es-EC', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    })
  }

  function handleReset() {
    setSubmitted(null)
    setAmount('')
    setProof(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <Landmark className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Datos para transferencia
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              Realiza la transferencia desde tu banco y luego adjunta el
              comprobante.
            </p>
          </div>
        </header>

        <dl className="mt-5 divide-y divide-slate-100">
          {bankRows.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-400">
                  {row.label}
                </dt>
                <dd className="truncate text-sm font-semibold text-slate-800">
                  {row.value}
                </dd>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(row.key, row.value)}
                aria-label={`Copiar ${row.label}`}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                {copiedKey === row.key ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex gap-2.5 rounded-2xl bg-amber-50 p-4 text-xs leading-relaxed text-amber-800 ring-1 ring-inset ring-amber-200">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            El saldo se acreditará únicamente cuando la administración valide el
            comprobante y libere la recarga.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {submitted ? (
          <div className="flex h-full flex-col items-center justify-center py-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock3 className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">
              Solicitud enviada
            </h2>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Pendiente de revisión
            </span>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Tu recarga de{' '}
              <span className="font-semibold text-slate-900">
                {formatCurrency(submitted.amount)}
              </span>{' '}
              quedó pendiente. La administración verificará el comprobante y
              liberará el saldo.
            </p>

            <div className="mt-5 w-full space-y-2 rounded-2xl bg-slate-50 p-4 text-left text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Comprobante</span>
                <span className="truncate font-medium text-slate-800">
                  {submitted.fileName}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Enviada</span>
                <span className="font-medium text-slate-800">
                  {submitted.submittedAt}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Enviar otra solicitud
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h2 className="text-lg font-semibold text-slate-900">
              Nueva solicitud de recarga
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Declara el monto transferido y adjunta tu comprobante.
            </p>

            <div className="mt-5">
              <label
                htmlFor="recharge-amount"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
              >
                Monto a recargar
              </label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-base font-semibold text-slate-400">
                  $
                </span>
                <input
                  id="recharge-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-base font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => setAmount(String(quickAmount))}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-brand-100 hover:text-brand-800"
                  >
                    {formatCurrency(quickAmount)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Comprobante de pago
              </span>
              <label
                htmlFor="recharge-proof"
                className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-4 py-6 text-center transition-colors hover:border-brand-300 hover:bg-brand-50/40"
              >
                {proof ? (
                  <>
                    <FileText className="size-6 text-brand-600" aria-hidden="true" />
                    <span className="max-w-full truncate text-sm font-medium text-slate-700">
                      {proof.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {(proof.size / 1024).toFixed(0)} KB · Toca para cambiar
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="size-6 text-slate-400" aria-hidden="true" />
                    <span className="text-sm font-medium text-slate-600">
                      Sube una foto o PDF del comprobante
                    </span>
                    <span className="text-xs text-slate-400">
                      JPG, PNG o PDF · máx. 5 MB
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  id="recharge-proof"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 ring-1 ring-inset ring-rose-200"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Enviar solicitud de recarga
            </button>

            <p className="mt-3 text-center text-xs leading-relaxed text-slate-400">
              La solicitud quedará en estado pendiente hasta que la
              administración confirme el ingreso.
            </p>
          </form>
        )}
      </section>
    </div>
  )
}
