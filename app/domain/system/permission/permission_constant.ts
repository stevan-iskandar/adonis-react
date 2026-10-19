export const PERMISSION_TABLE = 'permissions'

export const permission = {
  search: 'G.0.1',

  assetView: 'M.0.1',
  assetCreate: 'M.0.2',
  assetEdit: 'M.0.3',
  assetDelete: 'M.0.4',

  userView: 'S.0.1',
  userCreate: 'S.0.2',
  userEdit: 'S.0.3',
  userDelete: 'S.0.4',

  permissionView: 'S.1.1',

  roleView: 'S.2.1',
  roleCreate: 'S.2.2',
  roleEdit: 'S.2.3',
  roleDelete: 'S.2.4',
} as const

export type PermissionSlug = (typeof permission)[keyof typeof permission]
