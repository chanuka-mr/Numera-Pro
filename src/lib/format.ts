export function formatNumber(num: number): string {
  if (isNaN(num) || !isFinite(num)) return num.toString()
  const [intPart, fracPart] = num.toString().split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return fracPart === undefined ? grouped : `${grouped}.${fracPart}`
}