export const CPF_DIGITS = 11
export const CPF_MASK_LENGTH = 14
export const MIN_PASSWORD_LENGTH = 8

export function onlyDigits(value = '') {
  return String(value).replace(/\D/g, '')
}

export function normalizeCpf(value = '') {
  return onlyDigits(value).slice(0, CPF_DIGITS)
}

export function formatCpf(value = '') {
  const digits = normalizeCpf(value)

  if (!digits) {
    return ''
  }

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export function isCompleteCpf(value = '') {
  return normalizeCpf(value).length === CPF_DIGITS
}
