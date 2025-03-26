"use client";

import { ReactNode } from "react";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import Header from "@/app/components/layout/Header";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-brand-dark">
        <Header />
        <main className="flex-grow px-4 pb-4 xl:px-6 xl:pb-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}