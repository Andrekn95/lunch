import { X } from 'lucide-react'
import type { Student } from '../../../domain/entities'
import { Modal } from '../../shared/Modal'
import { formatCurrency } from '../../shared/utils/formatCurrency'
import { MockQrCode } from './MockQrCode'

interface StudentQrModalProps {
  open: boolean
  student: Student
  onClose: () => void
}

export function StudentQrModal({ open, student, onClose }: StudentQrModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      titleId="student-qr-title"
      maxWidthClassName="max-w-sm"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
            Código del estudiante
          </p>
          <h2
            id="student-qr-title"
            className="mt-1 text-xl font-semibold text-slate-900"
          >
            {student.name}
          </h2>
          <p className="text-sm text-slate-500">{student.grade}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar código QR"
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="mt-5">
        <MockQrCode value={student.qrCode} />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
        <span className="text-sm text-brand-800">Saldo disponible</span>
        <span className="text-sm font-semibold text-brand-900">
          {formatCurrency(student.balance)}
        </span>
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
        Muestra este código al personal de cocina para registrar el almuerzo.
      </p>
    </Modal>
  )
}
