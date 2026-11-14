export type BalanceStatus = 'healthy' | 'low' | 'empty'

export const LOW_BALANCE_THRESHOLD = 10

export function getBalanceStatus(balance: number): BalanceStatus {
  if (balance <= 0) return 'empty'
  if (balance < LOW_BALANCE_THRESHOLD) return 'low'
  return 'healthy'
}
