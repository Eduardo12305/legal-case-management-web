const DEFAULT_ERROR_MESSAGE = 'Nao foi possivel concluir esta etapa agora. Tente novamente em instantes.'

export function getErrorMessage(_error, fallback = DEFAULT_ERROR_MESSAGE) {
  return fallback
}

export function asArray(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.processes)) {
    return data.processes
  }

  if (Array.isArray(data?.clients)) {
    return data.clients
  }

  if (Array.isArray(data?.users)) {
    return data.users
  }

  if (Array.isArray(data?.results)) {
    return data.results
  }

  if (Array.isArray(data?.content)) {
    return data.content
  }

  if (Array.isArray(data?.items)) {
    return data.items
  }

  return []
}

export function formatJson(data) {
  return JSON.stringify(data, null, 2)
}

export function getEntityId(entity) {
  return entity?.id || entity?.clientId || entity?.userId || entity?._id || ''
}
