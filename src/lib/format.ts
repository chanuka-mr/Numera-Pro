export function formatNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) return num.toString()
  const [intPart, fracPart] = num.toString().split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return fracPart === undefined ? grouped : `${grouped}.${fracPart}`
}

export function roundResult(value: number, significantDigits = 12): number {
  if (!isFinite(value) || value === 0) return value
  return Number(value.toPrecision(significantDigits))
}