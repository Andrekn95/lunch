export const LUNCH_PRICE = 2.5

export type StudentPhotoTheme =
  | 'brand'
  | 'amber'
  | 'sky'
  | 'violet'
  | 'rose'
  | 'emerald'

export interface CanteenStudent {
  id: string
  name: string
  grade: string
  qrCode: string
  accessCode: string
  balance: number
  photoTheme: StudentPhotoTheme
}

export const initialCanteenStudents: CanteenStudent[] = [
  {
    id: 'student-001',
    name: 'Sofía Martínez',
    grade: '5° B',
    qrCode: 'LUNCH-SOFIA-5B-001',
    accessCode: '1712345601',
    balance: 18.5,
    photoTheme: 'brand',
  },
  {
    id: 'student-002',
    name: 'Mateo Ruiz',
    grade: '3° A',
    qrCode: 'LUNCH-MATEO-3A-002',
    accessCode: '1712345602',
    balance: 0,
    photoTheme: 'sky',
  },
  {
    id: 'student-003',
    name: 'Valentina Torres',
    grade: '4° B',
    qrCode: 'LUNCH-VALENTINA-4B-003',
    accessCode: '1712345603',
    balance: 4,
    photoTheme: 'rose',
  },
  {
    id: 'student-004',
    name: 'Lucas Pérez',
    grade: '6° A',
    qrCode: 'LUNCH-LUCAS-6A-004',
    accessCode: '1712345604',
    balance: 6,
    photoTheme: 'amber',
  },
  {
    id: 'student-005',
    name: 'Isabella Gómez',
    grade: '2° C',
    qrCode: 'LUNCH-ISABELLA-2C-005',
    accessCode: '1712345605',
    balance: 24,
    photoTheme: 'violet',
  },
  {
    id: 'student-006',
    name: 'Tomás Herrera',
    grade: '1° A',
    qrCode: 'LUNCH-TOMAS-1A-006',
    accessCode: '1712345606',
    balance: 8.5,
    photoTheme: 'emerald',
  },
]
