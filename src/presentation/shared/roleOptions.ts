import { ChefHat, ShieldCheck, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '../../domain/entities'

export interface RoleOption {
  id: UserRole
  label: string
  shortLabel: string
  icon: LucideIcon
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'parent',
    label: 'Padres / Alumnos',
    shortLabel: 'Padres',
    icon: Users,
  },
  {
    id: 'admin',
    label: 'Administración',
    shortLabel: 'Admin',
    icon: ShieldCheck,
  },
  {
    id: 'canteen',
    label: 'Cocina (POS)',
    shortLabel: 'Cocina',
    icon: ChefHat,
  },
]

export const ROLE_LABELS: Record<UserRole, string> = {
  parent: 'Portal Padres / Alumnos',
  admin: 'Panel Administración',
  canteen: 'Vista Cocina (POS)',
}
