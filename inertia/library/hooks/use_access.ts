import { type PermissionSlug } from '#domain/system/permission/permission_constant'
import { usePage } from '@inertiajs/react'
import { useCallback } from 'react'

export function useAccess() {
  const { permissions } = usePage().props.auth

  const can = useCallback((code: PermissionSlug) => permissions.includes(code), [permissions])

  return { can }
}
