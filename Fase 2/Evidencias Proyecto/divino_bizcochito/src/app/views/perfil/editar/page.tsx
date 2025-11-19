import React from 'react'
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute'
import BackButton from '@/app/components/BackButton/BackButton'
import EditProfile from '@/app/components/EditProfile/EditProfile'

function EditProfilePage() {
  return (
    <ProtectedRoute>
      <BackButton to="/views/perfil" />
      <EditProfile />
    </ProtectedRoute>
  )
}

export default EditProfilePage