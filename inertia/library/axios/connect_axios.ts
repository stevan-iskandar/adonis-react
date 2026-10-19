import { router } from '@inertiajs/react'
import { Modal } from 'antd'
import axios, { type AxiosError, type CreateAxiosDefaults } from 'axios'

interface ConnectProps {
  baseURL: string
  config?: CreateAxiosDefaults
}

export const connect = ({ baseURL }: ConnectProps) => {
  const baseAxios = axios.create({
    baseURL,
    timeout: 1000 * 60,
    headers: {
      Accept: 'application/json',
    },
  })

  baseAxios.interceptors.response.use(
    (response) => {
      // Any status code that lie within the range of 2xx cause this function to trigger
      // Do something with response data
      // console.log('2xx response')
      return response
    },
    (error) => {
      // Any status codes that falls outside the range of 2xx cause this function to trigger
      // Do something with response error
      const { data, status } = error.response || {}
      const { location } = window
      const modal = Modal

      // 401 now means genuinely unauthenticated — permission denials come back as 403,
      // so reloading here no longer bounces a logged-in user out of a page they may use.
      if (status === 401) {
        modal.error({
          title: data?.message,
          // content: '',
          onOk: () => {
            router.visit('/login')
          },
        })
      }

      if ([413].includes(status)) {
        modal.error({
          title: 'File too big!',
          okText: 'Close',
        })
      }

      if ([403].includes(status)) {
        // 403 is a permission denial, not an expired session — never reload or log out here.
        // Only some 403s carry a `detail`; fall back to the message so the modal is never blank.
        modal.error({
          title: data?.detail ?? data?.message,
          content: data?.detail ? data.message : undefined,
          okText: 'Close',
          closable: true,
          onOk: () => {
            location.replace(`${location.protocol}//${location.host}`)
          },
        })
      }

      if ([504].includes(status)) {
        modal.error({
          title: '504 | Gateway Timeout',
          // content: data.message,
          okText: 'Close',
          closable: true,
        })
      }

      if ([406, 500].includes(status)) {
        modal.error({
          title: 'Error!',
          content: data.message,
          okText: 'Close',
          closable: true,
        })
      }

      return Promise.reject(error as AxiosError)
    }
  )

  return baseAxios
}
