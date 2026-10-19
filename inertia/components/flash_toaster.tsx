import { usePage } from '@inertiajs/react'
import { useEffect } from 'react'
import { toast, Toaster } from 'sonner'

export default function FlashToaster() {
  const { url, flash } = usePage()

  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    if (flash.error) toast.error(flash.error)
    if (flash.success) toast.success(flash.success)
  })

  return <Toaster position="top-center" richColors />
}
