export const sortObjectArray = <T extends object>(array: T[], key: keyof T) => {
  return array.sort((a: T, b: T) =>
    String(a[key]).localeCompare(String(b[key]))
  )
}

export const removeWhitespace = (input: string): string => {
  return input.replace(/\s+/g, '')
}
