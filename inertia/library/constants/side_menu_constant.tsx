import { permission, type PermissionSlug } from '#domain/system/permission/permission_constant'
import { urlFor } from '#inertia/client'
import { Home, Settings, Users } from 'lucide-react'
import { type ReactNode } from 'react'

export type SideMenu = {
  key: string
  label: string
  icon?: ReactNode
  permission?: PermissionSlug
  path?: string
  children?: SideMenu[]
}

export const sideMenus: SideMenu[] = [
  {
    key: 'home',
    label: 'Home',
    icon: <Home size="1em" />,
    path: urlFor('web.home'),
  },
  {
    key: 'system',
    label: 'System',
    icon: <Settings size="1em" />,
    children: [
      {
        key: 'system-user',
        label: 'User',
        icon: <Users size="1em" />,
        permission: permission.userView,
        path: urlFor('web.system.user.index'),
      },
    ],
  },
]
