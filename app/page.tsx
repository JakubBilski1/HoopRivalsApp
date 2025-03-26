"use client"

import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import Loading from "./loading";

export default function Redirection() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated])
  return (
    <div>
      <Loading />
    </div>
  );
}
