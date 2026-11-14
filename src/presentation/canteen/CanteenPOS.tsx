import { lazy, Suspense, useCallback, useState } from 'react'
import { ChefHat, Clock3, ScanLine, UtensilsCrossed } from 'lucide-react'
import { StudentCheckoutCard } from './components/StudentCheckoutCard'
import type { CheckoutSummary } from './components/TransactionSuccessModal'
import { TransactionSuccessModal } from './components/TransactionSuccessModal'
import { StudentLookupPanel } from './components/StudentLookupPanel'
import { LUNCH_PRICE, initialCanteenStudents } from './data/canteenStudents'
import { formatCurrency } from '../shared/utils/formatCurrency'

const QrScannerModal = lazy(() =>
  import('./components/QrScannerModal').then((module) => ({
    default: module.QrScannerModal,
  })),
)

export function CanteenPOS() {
  const [students, setStudents] = useState(initialCanteenStudents)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  )
  const [quantity, setQuantity] = useState(1)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [success, setSuccess] = useState<CheckoutSummary | null>(null)
  const [servedToday, setServedToday] = useState(34)

  const selectedStudent =
    students.find((student) => student.id === selectedStudentId) ?? null

  function selectStudent(studentId: string) {
    setSelectedStudentId(studentId)
    setQuantity(1)
    setSearchError(null)
  }

  function handleSearch(query: string) {
    const normalized = query.trim().toLowerCase()

    const found = students.find(
      (student) =>
        student.qrCode.toLowerCase() === normalized ||
        student.accessCode === normalized ||
        student.name.toLowerCase().includes(normalized),
    )

    if (!found) {
      setSearchError(
        'No se encontró un alumno con ese código, cédula o nombre. Intenta de nuevo.',
      )
      return
    }

    selectStudent(found.id)
  }

  const handleScan = useCallback(
    (code: string) => {
      setScannerOpen(false)

      const normalized = code.trim().toLowerCase()
      const found = students.find(
        (student) =>
          student.qrCode.toLowerCase() === normalized ||
          student.accessCode === normalized,
      )

      if (!found) {
        setSearchError(
          'El código escaneado no pertenece a un alumno registrado.',
        )
        return
      }

      setSelectedStudentId(found.id)
      setQuantity(1)
      setSearchError(null)
    },
    [students],
  )

  function handleConfirm() {
    if (!selectedStudent) return

    const total = quantity * LUNCH_PRICE
    if (total > selectedStudent.balance) return

    const newBalance = Number((selectedStudent.balance - total).toFixed(2))

    setStudents((current) =>
      current.map((student) =>
        student.id === selectedStudent.id
          ? { ...student, balance: newBalance }
          : student,
      ),
    )
    setServedToday((current) => current + quantity)
    setSuccess({
      studentName: selectedStudent.name,
      quantity,
      total,
      newBalance,
    })
  }

  const handleSuccessDone = useCallback(() => {
    setSuccess(null)
    setSelectedStudentId(null)
    setQuantity(1)
  }, [])

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-700 text-white">
            <ChefHat className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-700">
              Punto de venta
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Cocina / Caja
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
            <UtensilsCrossed className="size-3.5" aria-hidden="true" />
            {servedToday} almuerzos hoy
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
            <Clock3 className="size-3.5" aria-hidden="true" />
            Precio {formatCurrency(LUNCH_PRICE)}
          </span>
        </div>
      </header>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <StudentLookupPanel
            error={searchError}
            demoStudents={students}
            selectedStudentId={selectedStudentId}
            onSearch={handleSearch}
            onOpenScanner={() => setScannerOpen(true)}
            onSelectStudent={(student) => selectStudent(student.id)}
          />
        </div>

        <div className="lg:col-span-3">
          {selectedStudent ? (
            <StudentCheckoutCard
              student={selectedStudent}
              quantity={quantity}
              lunchPrice={LUNCH_PRICE}
              onChangeQuantity={setQuantity}
              onConfirm={handleConfirm}
              onClear={() => {
                setSelectedStudentId(null)
                setQuantity(1)
              }}
            />
          ) : (
            <section className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/70 p-8 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <ScanLine className="size-8" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                Esperando alumno
              </h2>
              <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500">
                Escanea el QR del carnet o usa el ingreso manual para ver el
                saldo y cobrar los almuerzos.
              </p>
            </section>
          )}
        </div>
      </div>

      {scannerOpen && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 text-sm font-semibold text-white">
              Abriendo escáner…
            </div>
          }
        >
          <QrScannerModal
            demoCodes={students.map((student) => student.qrCode)}
            onScan={handleScan}
            onClose={() => setScannerOpen(false)}
          />
        </Suspense>
      )}

      {success && (
        <TransactionSuccessModal summary={success} onDone={handleSuccessDone} />
      )}
    </div>
  )
}
