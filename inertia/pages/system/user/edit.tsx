import { type Data } from '@generated/data'
import { usePage } from '@inertiajs/react'

export default function UserEdit({ user }: { user: Data.System.User }) {
  const { auth } = usePage().props

  return (
    <>
      {user.email} edited by {auth.user?.firstName}
    </>
  )
}
