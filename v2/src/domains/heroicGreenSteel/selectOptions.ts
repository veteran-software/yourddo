const labelCollator = new Intl.Collator('en', { sensitivity: 'base', numeric: true })

export interface HgsSelectOption {
  value: string
  label: string
}

export const sortHgsSelectOptions = (options: readonly HgsSelectOption[]): HgsSelectOption[] =>
  options.toSorted(
    (left, right) => labelCollator.compare(left.label, right.label) || Number(left.value) - Number(right.value)
  )

export const toHgsSelectOptions = <T extends { id: number }>(
  items: readonly T[],
  label: (item: T) => string
): HgsSelectOption[] => sortHgsSelectOptions(items.map((item) => ({ value: item.id.toString(), label: label(item) })))
