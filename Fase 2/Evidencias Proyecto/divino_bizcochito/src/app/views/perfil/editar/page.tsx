import React from 'react'
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute'
import EditProfile from '@/app/components/EditProfile/EditProfile'

function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfile />
    </ProtectedRoute>
  )
}

export default EditProfilePage