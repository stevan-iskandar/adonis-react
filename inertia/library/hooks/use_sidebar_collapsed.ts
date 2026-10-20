import { useCallback, useState } from 'react'

const STORAGE_KEY = 'sidebar-collapsed'

const read = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // A browser set to block site data throws on the property itself.
    return false
  }
}

/**
 * Sidebar collapse state, remembered per browser.
 *
 * Read lazily on first render rather than in an effect: the sider would
 * otherwise flash open before correcting itself. SSR is off, so there is no
 * server markup to disagree with.
 */
export function useSidebarCollapsed(): [boolean, (value: boolean) => void] {
  const [collapsed, setCollapsed] = useState(read)

  const update = useCallback((value: boolean) => {
    setCollapsed(value)

    try {
      window.localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // Preference is not persisted; the session still works.
    }
  }, [])

  return [collapsed, update]
}
