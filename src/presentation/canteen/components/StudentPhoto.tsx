import type { StudentPhotoTheme } from '../data/canteenStudents'

const THEMES: Record<StudentPhotoTheme, string> = {
  brand: 'from-brand-400 to-teal-600',
  amber: 'from-amber-400 to-orange-500',
  sky: 'from-sky-400 to-blue-600',
  violet: 'from-violet-400 to-purple-600',
  rose: 'from-rose-400 to-pink-600',
  emerald: 'from-emerald-400 to-green-600',
}

interface StudentPhotoProps {
  name: string
  theme: StudentPhotoTheme
  className?: string
}

export function StudentPhoto({
  name,
  theme,
  className = 'size-20',
}: StudentPhotoProps) {
  return (
    <div
      className={`flex shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${THEMES[theme]} ${className}`}
      role="img"
      aria-label={`Foto de ${name}`}
    >
      <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
        <circle cx="50" cy="35" r="17" fill="#ffffff" fillOpacity="0.92" />
        <path
          d="M14 100c2-21 17-33 36-33s34 12 36 33z"
          fill="#ffffff"
          fillOpacity="0.92"
        />
      </svg>
    </div>
  )
}
