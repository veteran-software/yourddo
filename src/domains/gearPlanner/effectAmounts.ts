const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 })

// Remove binary arithmetic noise at integer boundaries before truncating for display.
const wholePercent = (points: number) => Math.trunc(Number(points.toFixed(10)))

export function formatAmount(amount: number, unit = '', signed = false, rounding?: 'round' | 'trunc') {
  let value = amount
  if (rounding === 'round') value = Math.sign(amount) * Math.round(Number(Math.abs(amount).toFixed(10)))
  else if (unit === '%' || rounding === 'trunc') value = wholePercent(amount)
  return (signed && value > 0 ? '+' : '') + number.format(value || 0) + unit
}

export function percentModifier(points: number, signed = false) {
  const whole = wholePercent(points)
  return {
    modifier: (signed && whole > 0 ? '+' : '') + String(whole) + '%',
    ...(whole !== points && { calculationValue: points })
  }
}

export function displayPercentModifier(modifier: string | undefined) {
  if (!modifier || !/^[+-]?(?:\d+\.?\d*|\.\d+)%$/.test(modifier)) return { modifier }
  return percentModifier(Number(modifier.slice(0, -1)), modifier.startsWith('+'))
}
