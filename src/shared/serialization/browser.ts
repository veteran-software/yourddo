export const copyText = (text: string): Promise<void> => navigator.clipboard.writeText(text)

export const downloadTextFile = (text: string, filename: string, type = 'application/json'): void => {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const readTextFile = (file: File): Promise<string> => file.text()
