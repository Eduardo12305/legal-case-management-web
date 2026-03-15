export const ROLES = {
  ADMIN: 'ADMIN',
  LAWYER: 'LAWYER',
  CLIENT: 'CLIENT',
  STAFF: 'STAFF',
}

export function canManageUsers(role) {
  return role === ROLES.ADMIN || role === ROLES.LAWYER
}

export function isAdmin(role) {
  return role === ROLES.ADMIN
}

export function isClient(role) {
  return role === ROLES.CLIENT
}

export function isLawyerOrAdmin(role) {
  return role === ROLES.ADMIN || role === ROLES.LAWYER
}

export function isLawyer(role) {
  return role === ROLES.LAWYER
}

export function canViewProcessesMenu(role) {
  return [ROLES.ADMIN, ROLES.LAWYER].includes(role)
}

export function canSearchProcessesByClient(role) {
  return [ROLES.ADMIN, ROLES.LAWYER].includes(role)
}

export function canCreateProcesses(role) {
  return role === ROLES.LAWYER
}

export function canEditProcessContent(role) {
  return role === ROLES.LAWYER
}

export function canAccessProcessDetails(role) {
  return [ROLES.ADMIN, ROLES.LAWYER, ROLES.CLIENT].includes(role)
}

export function getCreatableRoles(role) {
  if (role === ROLES.ADMIN) {
    return [ROLES.CLIENT, ROLES.STAFF, ROLES.LAWYER]
  }

  if (role === ROLES.LAWYER) {
    return [ROLES.CLIENT]
  }

  return []
}
