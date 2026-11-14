import type { Student, WeekDay } from '../../../domain/entities'

export const LUNCH_PRICE = 2.5

export const demoStudent: Student = {
  id: 'student-001',
  parentId: 'parent-001',
  name: 'Sofía Martínez',
  grade: '5° B',
  balance: 18.5,
  qrCode: 'LUNCH-SOFIA-5B-001',
}

export interface MenuDayView {
  day: WeekDay
  dayLabel: string
  dateLabel: string
  mainDish: string
  sideDish: string
  drink: string
  isToday: boolean
}

export const demoWeeklyMenu: MenuDayView[] = [
  {
    day: 'monday',
    dayLabel: 'Lunes',
    dateLabel: '2 de noviembre',
    mainDish: 'Pollo al horno con arroz',
    sideDish: 'Sopa de verduras',
    drink: 'Jugo de naranja',
    isToday: false,
  },
  {
    day: 'tuesday',
    dayLabel: 'Martes',
    dateLabel: '3 de noviembre',
    mainDish: 'Carne guisada con puré',
    sideDish: 'Crema de zanahoria',
    drink: 'Agua de frutas',
    isToday: true,
  },
  {
    day: 'wednesday',
    dayLabel: 'Miércoles',
    dateLabel: '4 de noviembre',
    mainDish: 'Pescado a la plancha con ensalada',
    sideDish: 'Sopa de lentejas',
    drink: 'Limonada',
    isToday: false,
  },
  {
    day: 'thursday',
    dayLabel: 'Jueves',
    dateLabel: '5 de noviembre',
    mainDish: 'Pasta boloñesa',
    sideDish: 'Sopa de pollo',
    drink: 'Jugo de mango',
    isToday: false,
  },
  {
    day: 'friday',
    dayLabel: 'Viernes',
    dateLabel: '6 de noviembre',
    mainDish: 'Arroz con pollo y maduro',
    sideDish: 'Consomé de res',
    drink: 'Batido de fresa',
    isToday: false,
  },
]

export const demoLunchesThisMonth = 12

export interface RecentConsumption {
  id: string
  dateLabel: string
  description: string
  amount: number
}

export const demoRecentConsumptions: RecentConsumption[] = [
  {
    id: 'consumption-001',
    dateLabel: 'Hoy · 12:34',
    description: 'Almuerzo · Carne guisada',
    amount: LUNCH_PRICE,
  },
  {
    id: 'consumption-002',
    dateLabel: 'Lun 2 nov · 12:20',
    description: 'Almuerzo · Pollo al horno',
    amount: LUNCH_PRICE,
  },
  {
    id: 'consumption-003',
    dateLabel: 'Vie 30 oct · 12:41',
    description: 'Almuerzo · Arroz con pollo',
    amount: LUNCH_PRICE,
  },
]

export interface BankAccount {
  bank: string
  accountType: string
  accountNumber: string
  holder: string
  documentId: string
}

export const demoBankAccount: BankAccount = {
  bank: 'Banco Pichincha',
  accountType: 'Cuenta de Ahorros',
  accountNumber: '2100 3456 7890',
  holder: 'Comedor Escolar Lunch',
  documentId: '1712345678-001',
}
