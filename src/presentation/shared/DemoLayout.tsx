import { useState } from 'react'
import { motion } from 'framer-motion'
import { UtensilsCrossed } from 'lucide-react'
import type { UserRole } from '../../domain/entities'
import { AdminDashboard } from '../admin/AdminDashboard'
import { CanteenPOS } from '../canteen/CanteenPOS'
import { ParentDashboard } from '../parents/ParentDashboard'
import { RoleSelector } from './RoleSelector'
import { ROLE_LABELS } from './roleOptions'

function ActiveView({ role }: { role: UserRole }) {
  switch (role) {
    case 'parent':
      return <ParentDashboard />
    case 'admin':
      return <AdminDashboard />
    case 'canteen':
      return <CanteenPOS />
  }
}

export function DemoLayout() {
  const [activeRole, setActiveRole] = useState<UserRole>('parent')

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-700 text-white">
            <UtensilsCrossed className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-semibold leading-tight text-slate-900">
              Lunch
            </p>
            <p className="text-xs text-slate-500">Comedor escolar</p>
          </div>

          <div className="ml-auto flex min-w-0 items-center gap-2">
            <span className="hidden text-xs text-slate-400 sm:inline">
              Vista activa
            </span>
            <span className="max-w-[46vw] truncate rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 sm:max-w-none">
              {ROLE_LABELS[activeRole]}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-32 pt-10 sm:px-6 sm:pt-14">
        <motion.div
          key={activeRole}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <ActiveView role={activeRole} />
        </motion.div>
      </main>

      <RoleSelector activeRole={activeRole} onChange={setActiveRole} />
    </div>
  )
}
