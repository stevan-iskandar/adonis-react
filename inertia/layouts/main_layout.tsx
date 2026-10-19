import { type SideMenu } from '#inertia/library/constants/side_menu_constant'
import { useSideMenus } from '#inertia/library/hooks/use_side_menus'
import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { router, usePage } from '@inertiajs/react'
import { Layout, Menu, type MenuProps } from 'antd'
import { type ReactElement } from 'react'

type MenuItem = Required<MenuProps>['items'][number]

const toItem = (menu: SideMenu): MenuItem => ({
  key: menu.key,
  label: menu.label,
  icon: menu.icon,
  children: menu.children?.map(toItem),
})

export default function MainLayout({ children }: { children: ReactElement<Data.SharedProps> }) {
  const menus = useSideMenus()
  const { url } = usePage()
  const flat = menus.flatMap((menu) => [menu, ...(menu.children ?? [])])
  const selected = flat.find((menu) => menu.path && menu.path !== '/' && url.startsWith(menu.path))

  return (
    <Layout>
      <Layout.Sider>
        <Menu
          mode="inline"
          items={menus.map(toItem)}
          selectedKeys={selected ? [selected.key] : []}
          onClick={({ key }) => {
            const path = flat.find((menu) => menu.key === key)?.path
            if (path) router.visit(path)
          }}
        />
      </Layout.Sider>
      <Layout>
        <Layout.Header>
          <span>{children.props.auth.user?.firstName}</span>
          <Form route="web.auth.logout.submit">
            <button type="submit">Logout</button>
          </Form>
        </Layout.Header>
        <Layout.Content>{children}</Layout.Content>
        <Layout.Footer />
      </Layout>
    </Layout>
  )
}
