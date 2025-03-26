"use client"; // Ten komponent działa po stronie klienta

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import Loading from "@/app/loading";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/"); // Przekierowuje użytkownika na stronę logowania, jeśli nie jest zalogowany
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Loading />
      </div>
    ); // Wyświetla komunikat ładowania, jeśli trwa sprawdzanie autoryzacji
  }

  if (!isAuthenticated) {
    return null; // Uniemożliwia wyświetlenie zawartości, zanim użytkownik zostanie przekierowany
  }

  return <>{children}</>;
}