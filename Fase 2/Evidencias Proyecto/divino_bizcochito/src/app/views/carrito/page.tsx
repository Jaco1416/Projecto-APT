import React from 'react'
import CarritoCheck from '@/app/components/CarritoCheck/CarritoCheck';
import ProtectedRoute from '@/app/components/protectedRoute/protectedRoute';

function CarritoPage() {
  return (
    <ProtectedRoute>
        <CarritoCheck />
    </ProtectedRoute>
  )
}

export default CarritoPage