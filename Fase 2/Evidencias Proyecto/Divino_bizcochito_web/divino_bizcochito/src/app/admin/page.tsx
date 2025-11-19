"use client";
import ProtectedRoute from "@/app/components/protectedRoute/protectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute role="admin">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p>Solo accesible por usuarios con rol "admin".</p>
      </div>
    </ProtectedRoute>
  );
}
  