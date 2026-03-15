export const PROCESS_STATUS_OPTIONS = [
  'ACTIVE',
  'ARCHIVED',
  'SUSPENDED',
  'CLOSED',
  'WON',
  'LOST',
]

export function createProcessFormState(process = {}) {
  return {
    processNumber: process.processNumber || process.number || '',
    title: process.title || '',
    status: process.status || 'ACTIVE',
    description: process.description || '',
    court: process.court || '',
    instance: process.instance || '',
    subject: process.subject || '',
    value:
      process.value === 0 || process.value
        ? String(process.value)
        : '',
  }
}

export function buildProcessPayload(form) {
  return {
    processNumber: form.processNumber.trim(),
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    court: form.court.trim() || undefined,
    instance: form.instance.trim() || undefined,
    subject: form.subject.trim() || undefined,
    value: form.value !== '' ? Number(form.value) : undefined,
  }
}
