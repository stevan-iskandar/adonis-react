import { sideMenus, type SideMenu } from '#inertia/library/constants/side_menu_constant'
import { useAccess } from '#inertia/library/hooks/use_access'
import { useMemo } from 'react'

export function useSideMenus() {
  const { can } = useAccess()

  return useMemo(() => {
    const allowed = (menus: SideMenu[]): SideMenu[] =>
      menus.flatMap((menu) => {
        if (menu.permission && !can(menu.permission)) return []
        if (!menu.children) return [menu]

        const children = allowed(menu.children)
        return children.length ? [{ ...menu, children }] : []
      })

    return allowed(sideMenus)
  }, [can])
}
