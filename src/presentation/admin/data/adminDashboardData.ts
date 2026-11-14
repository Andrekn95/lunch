import type { TransactionStatus } from '../../../domain/entities'

export interface TransferReceipt {
  bank: string
  reference: string
  sender: string
  transferredAt: string
}

export interface AdminTransfer {
  id: string
  studentId: string
  studentName: string
  parentName: string
  amount: number
  createdAt: string
  status: TransactionStatus
  approvedAt: string | null
  receipt: TransferReceipt
}

export const initialTransfers: AdminTransfer[] = [
  {
    id: 'transfer-001',
    studentId: 'student-001',
    studentName: 'Sofía Martínez',
    parentName: 'María Martínez',
    amount: 25,
    createdAt: '3 nov · 09:42',
    status: 'pending',
    approvedAt: null,
    receipt: {
      bank: 'Banco Pichincha',
      reference: 'PICH-884213',
      sender: 'María Martínez',
      transferredAt: '3 nov 2026 · 09:38',
    },
  },
  {
    id: 'transfer-002',
    studentId: 'student-002',
    studentName: 'Mateo Ruiz',
    parentName: 'Carlos Ruiz',
    amount: 15,
    createdAt: '3 nov · 08:15',
    status: 'pending',
    approvedAt: null,
    receipt: {
      bank: 'Banco Guayaquil',
      reference: 'BGU-550921',
      sender: 'Carlos Ruiz',
      transferredAt: '3 nov 2026 · 08:10',
    },
  },
  {
    id: 'transfer-003',
    studentId: 'student-003',
    studentName: 'Valentina Torres',
    parentName: 'Ana Torres',
    amount: 20,
    createdAt: '2 nov · 16:20',
    status: 'approved',
    approvedAt: '2 nov · 17:05',
    receipt: {
      bank: 'Banco Pichincha',
      reference: 'PICH-771034',
      sender: 'Ana Torres',
      transferredAt: '2 nov 2026 · 16:14',
    },
  },
  {
    id: 'transfer-004',
    studentId: 'student-004',
    studentName: 'Lucas Pérez',
    parentName: 'Jorge Pérez',
    amount: 30,
    createdAt: '2 nov · 14:02',
    status: 'rejected',
    approvedAt: null,
    receipt: {
      bank: 'Banco del Pacífico',
      reference: 'PAC-000000',
      sender: 'Jorge Pérez',
      transferredAt: '2 nov 2026 · 13:55',
    },
  },
  {
    id: 'transfer-005',
    studentId: 'student-005',
    studentName: 'Isabella Gómez',
    parentName: 'Paola Gómez',
    amount: 40,
    createdAt: '2 nov · 11:30',
    status: 'approved',
    approvedAt: '2 nov · 12:10',
    receipt: {
      bank: 'Banco Pichincha',
      reference: 'PICH-662198',
      sender: 'Paola Gómez',
      transferredAt: '2 nov 2026 · 11:24',
    },
  },
  {
    id: 'transfer-006',
    studentId: 'student-006',
    studentName: 'Tomás Herrera',
    parentName: 'Diego Herrera',
    amount: 10,
    createdAt: '1 nov · 18:47',
    status: 'pending',
    approvedAt: null,
    receipt: {
      bank: 'Cooperativa JEP',
      reference: 'JEP-309145',
      sender: 'Diego Herrera',
      transferredAt: '1 nov 2026 · 18:40',
    },
  },
]

export interface AdminStudent {
  id: string
  parentName: string
  name: string
  grade: string
  balance: number
  qrCode: string
}

export const initialStudents: AdminStudent[] = [
  {
    id: 'student-001',
    parentName: 'María Martínez',
    name: 'Sofía Martínez',
    grade: '5° B',
    balance: 18.5,
    qrCode: 'LUNCH-SOFIA-5B-001',
  },
  {
    id: 'student-002',
    parentName: 'Carlos Ruiz',
    name: 'Mateo Ruiz',
    grade: '3° A',
    balance: 0,
    qrCode: 'LUNCH-MATEO-3A-002',
  },
  {
    id: 'student-003',
    parentName: 'Ana Torres',
    name: 'Valentina Torres',
    grade: '4° B',
    balance: 4,
    qrCode: 'LUNCH-VALENTINA-4B-003',
  },
  {
    id: 'student-004',
    parentName: 'Jorge Pérez',
    name: 'Lucas Pérez',
    grade: '6° A',
    balance: 6,
    qrCode: 'LUNCH-LUCAS-6A-004',
  },
  {
    id: 'student-005',
    parentName: 'Paola Gómez',
    name: 'Isabella Gómez',
    grade: '2° C',
    balance: 24,
    qrCode: 'LUNCH-ISABELLA-2C-005',
  },
  {
    id: 'student-006',
    parentName: 'Diego Herrera',
    name: 'Tomás Herrera',
    grade: '1° A',
    balance: 8.5,
    qrCode: 'LUNCH-TOMAS-1A-006',
  },
  {
    id: 'student-007',
    parentName: 'Lucía Castro',
    name: 'Emilia Castro',
    grade: '7° B',
    balance: 12,
    qrCode: 'LUNCH-EMILIA-7B-007',
  },
  {
    id: 'student-008',
    parentName: 'Andrés Rivas',
    name: 'Daniel Rivas',
    grade: '5° A',
    balance: 36,
    qrCode: 'LUNCH-DANIEL-5A-008',
  },
]
