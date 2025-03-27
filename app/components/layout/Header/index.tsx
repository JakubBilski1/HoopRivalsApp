"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FaBars } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { router } from '@/utils/router';
import { useUser } from "@/app/context/UserContext"; // adjust path as needed
import { useEffect } from "react";

export default function Header() {
  const appRouter = useRouter();
  const { user, setUser } = useUser();
  
  const avatarSrc = user?.avatarUrl || "/placeholder.webp";

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("/api/user", {
        method: "GET"
      });
      if(response.status === 401) {
        window.location.href = "/login";
      } else if(response.status === 200) {
        const data = await response.json();
        setUser(data);
      }
    };
    !user && fetchUser();
  }, [user]);

  return (
    <header className="bg-gray-800 shadow-xl">
      <nav className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={90}
            height={90}
            className="rounded-full"
          />
        </Link>

        {/* Desktop Navigation with Avatar */}
        <div className="hidden md:flex items-center space-x-8">
          {router.map((route, index) => (
            <Link
              key={index}
              href={route.link}
              className="text-white text-lg font-semibold hover:text-orange-400 transition-colors"
            >
              {route.name}
            </Link>
          ))}
          {/* Avatar next to links */}
          <Avatar className="w-16 h-16 cursor-pointer" onClick={() => { appRouter.push('/dashboard'); }}>
            <AvatarImage src={avatarSrc ? avatarSrc : 'placeholder.webp'} alt="User Avatar" />
            <AvatarFallback>UA</AvatarFallback>
          </Avatar>
        </div>

        {/* Mobile Navigation with Hamburger and Avatar */}
        <div className="md:hidden flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <button aria-label="Toggle navigation menu">
                <FaBars className="h-5 w-5" aria-hidden="true" />
              </button>
            </SheetTrigger>

            <SheetContent
              side="top"
              className="bg-gray-900 text-white w-screen h-screen p-4 border-0"
            >
              <SheetHeader>
                <SheetTitle className="text-2xl font-semibold"></SheetTitle>
              </SheetHeader>

              <div className="flex flex-col items-center justify-center h-full space-y-8">
                {router.map((route, index) => (
                  <SheetClose key={index} asChild>
                    <Link
                      href={route.link}
                      className="text-3xl font-bold hover:text-orange-400 transition-colors"
                    >
                      {route.name}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Avatar */}
          <Avatar className="cursor-pointer w-14 h-14" onClick={() => { appRouter.push('/dashboard'); }}>
            <AvatarImage src={avatarSrc} alt="User Avatar" />
            <AvatarFallback>UA</AvatarFallback>
          </Avatar>
        </div>
      </nav>
    </header>
  );
}
