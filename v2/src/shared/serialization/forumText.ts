export const escapeBbCode = (value: string): string => value.replaceAll('[', '&#91;').replaceAll(']', '&#93;')

export const escapeMarkdown = (value: string): string => value.replace(/[\\`*_~]/g, '\\$&')
