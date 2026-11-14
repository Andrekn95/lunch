import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { CameraOff, ScanLine, X } from 'lucide-react'
import { Modal } from '../../shared/Modal'

const READER_ID = 'canteen-qr-reader'

interface QrScannerModalProps {
  demoCodes: string[]
  onScan: (code: string) => void
  onClose: () => void
}

export function QrScannerModal({
  demoCodes,
  onScan,
  onClose,
}: QrScannerModalProps) {
  const [cameraError, setCameraError] = useState<string | null>(null)
  const onScanRef = useRef(onScan)
  const hasScannedRef = useRef(false)

  useEffect(() => {
    onScanRef.current = onScan
  }, [onScan])

  useEffect(() => {
    let cancelled = false
    let scanner: Html5Qrcode | null = null

    async function startCamera() {
      try {
        scanner = new Html5Qrcode(READER_ID, {
          verbose: false,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        })

        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            if (cancelled || hasScannedRef.current) return
            hasScannedRef.current = true
            onScanRef.current(decodedText)
          },
          () => undefined,
        )
      } catch {
        if (!cancelled) {
          setCameraError(
            'No se pudo iniciar la cámara. Usa el ingreso manual o el escaneo simulado.',
          )
        }
      }
    }

    void startCamera()

    return () => {
      cancelled = true
      const instance = scanner
      if (!instance) return
      instance
        .stop()
        .then(() => instance.clear())
        .catch(() => undefined)
    }
  }, [])

  function handleDemoScan() {
    const randomCode = demoCodes[Math.floor(Math.random() * demoCodes.length)]
    if (randomCode) onScan(randomCode)
  }

  return (
    <Modal
      open
      onClose={onClose}
      titleId="qr-scanner-title"
      maxWidthClassName="max-w-sm"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
            Escáner QR
          </p>
          <h2
            id="qr-scanner-title"
            className="mt-1 text-xl font-semibold text-slate-900"
          >
            Escanear carnet
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar escáner"
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div className="relative mt-4 overflow-hidden rounded-2xl bg-slate-900">
        <div
          id={READER_ID}
          className="aspect-square w-full overflow-hidden [&_video]:size-full [&_video]:object-cover"
        />
      </div>

      {cameraError ? (
        <p className="mt-3 flex gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800 ring-1 ring-inset ring-amber-200">
          <CameraOff className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {cameraError}
        </p>
      ) : (
        <p className="mt-3 text-center text-xs text-slate-500">
          Apunta el código QR del carnet al centro del visor.
        </p>
      )}

      <button
        type="button"
        onClick={handleDemoScan}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-bold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <ScanLine className="size-4" aria-hidden="true" />
        Simular escaneo (demo)
      </button>

      <p className="mt-2 text-center text-[11px] text-slate-400">
        En producción, la cámara lee el QR real del estudiante.
      </p>
    </Modal>
  )
}
