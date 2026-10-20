import { urlFor } from '#inertia/client'
import FlashToaster from '#inertia/components/flash_toaster'
import { env } from '#inertia/library/constants/env_constant'
import { type SideMenu } from '#inertia/library/constants/side_menu_constant'
import { useSideMenus } from '#inertia/library/hooks/use_side_menus'
import { useSidebarCollapsed } from '#inertia/library/hooks/use_sidebar_collapsed'
import { Link } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { Head, router, usePage } from '@inertiajs/react'
import {
  App,
  Avatar,
  Button,
  ConfigProvider,
  Dropdown,
  Layout,
  Menu,
  theme,
  Typography,
  type MenuProps,
} from 'antd'
import { CircleAlert, LogOut, PanelLeftClose, PanelLeftOpen, User } from 'lucide-react'
import { useMemo, type ReactElement } from 'react'

type MenuItem = Required<MenuProps>['items'][number]

const ownsPath = (path: string, segments: string[]): boolean => {
  if (path === '/') {
    return segments.length === 2 && segments[1] === ''
  }

  const own = path.split('/')

  return own.every((segment, index) => segment === segments[index])
}

const findTrail = (menus: SideMenu[], segments: string[]): SideMenu[] => {
  for (const menu of menus) {
    const childTrail = findTrail(menu.children ?? [], segments)

    if (childTrail.length) {
      return [menu, ...childTrail]
    }

    if (menu.path && ownsPath(menu.path, segments)) {
      return [menu]
    }
  }

  return []
}

interface Props {
  title?: string
  children: ReactElement<Data.SharedProps>
}

export default function MainLayout({ title, children }: Props) {
  const menus = useSideMenus()
  const { url, props } = usePage()
  const { modal } = App.useApp()
  const {
    token: { colorBgContainer, colorPrimary, colorTextLightSolid },
  } = theme.useToken()

  const [collapsed, setCollapsed] = useSidebarCollapsed()

  /**
   * Inertia's `url` carries the query string; menu paths do not.
   */
  const pathname = url.split('?')[0]

  const trail = useMemo(() => findTrail(menus, pathname.split('/')), [menus, pathname])

  /**
   * The entry that owns the page, which is the parent for anything nested:
   * /user/create and /user/{id} both keep User highlighted.
   */
  const active = trail[trail.length - 1]
  const selectedKeys = active ? [active.path ?? active.key] : []

  /**
   * A page that names no title falls back to its menu entry's label.
   */
  const heading = title ?? active?.label ?? env.appName

  /**
   * The group holding the current page starts open, and antd owns it from
   * there, so the user can close it without the layout forcing it back.
   * Remounting on navigation re-seeds it; a collapsed sider renders groups as
   * flyouts, where pinned keys would stay stuck open.
   */
  const defaultOpenKeys = collapsed ? [] : trail.slice(0, -1).map((menu) => menu.key)

  const items = useMemo(() => {
    const toItem = (menu: SideMenu): MenuItem => ({
      key: menu.path ?? menu.key,
      icon: menu.icon,
      label: menu.path ? <Link href={menu.path}>{menu.label}</Link> : menu.label,
      ...(menu.children?.length && {
        children: menu.children.map(toItem),
      }),
    })

    return menus.map(toItem)
  }, [menus])

  const confirmLogout = () =>
    modal.confirm({
      title: 'Confirmation',
      icon: <CircleAlert size="1em" />,
      content: 'Do you want to sign out of this application?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => router.post(urlFor('web.auth.logout.submit')),
    })

  const user = props.auth.user

  return (
    <>
      <Head title={heading} />

      <Layout className="min-h-dvh!">
        <Layout.Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          trigger={null}
          breakpoint="lg"
          width={230}
          style={{ background: colorPrimary }}
        >
          <div className="flex h-16 items-center justify-center px-4">
            <Typography.Text strong ellipsis style={{ color: colorTextLightSolid }}>
              {collapsed ? env.appName.slice(0, 2).toUpperCase() : env.appName}
            </Typography.Text>
          </div>

          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  darkItemBg: 'transparent',
                  darkSubMenuItemBg: 'rgba(0, 0, 0, 0.16)',
                  darkItemSelectedBg: 'rgba(255, 255, 255, 0.2)',
                },
              },
            }}
          >
            <Menu
              key={`${pathname}-${collapsed}`}
              mode="inline"
              theme="dark"
              selectedKeys={selectedKeys}
              defaultOpenKeys={defaultOpenKeys}
              items={items}
            />
          </ConfigProvider>
        </Layout.Sider>

        <Layout>
          <Layout.Header
            className="flex items-center gap-4 px-4! shadow-sm"
            style={{ background: colorBgContainer }}
          >
            <Button
              type="text"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              icon={collapsed ? <PanelLeftOpen size="1em" /> : <PanelLeftClose size="1em" />}
              onClick={() => setCollapsed(!collapsed)}
            />

            <Typography.Title level={4} className="mb-0! flex-1 truncate">
              {heading}
            </Typography.Title>

            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              arrow
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogOut size="1em" />,
                    label: 'Sign out',
                    danger: true,
                    onClick: confirmLogout,
                  },
                ],
              }}
            >
              <button
                type="button"
                className="flex cursor-pointer items-center gap-2 border-0 bg-transparent"
              >
                <Avatar size="small" icon={<User size="1em" />} />
                <span className="hidden sm:inline">
                  {[user?.firstName, user?.lastName].filter(Boolean).join(' ')}
                </span>
              </button>
            </Dropdown>
          </Layout.Header>

          <Layout.Content className="p-6">{children}</Layout.Content>
        </Layout>
      </Layout>

      <FlashToaster />
    </>
  )
}
