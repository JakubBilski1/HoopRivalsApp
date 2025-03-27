"use client";

import Image from "next/image";
import { useState, ChangeEvent, FormEvent, FC } from "react";

// Import shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ButtonLoading from "../button-loading";

// Optional: Import your local Hoop Rivals logo from the public folder

const LoginPage: FC = () => {
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    nickname: "",
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAuthData({
      ...authData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify(authData),
      });
      let error = "";
      if (!response.ok) {
        error = await response.text();
      }
      if (response.status === 201) {
        toast.success("Account created successfully");
        router.push("/login");
      } else if (response.status === 400) {
        console.log('error', error)
        toast.error(error);
      } else if (response.status === 500) {
        toast.error("Internal server error");
      }
    } catch (e) {
      toast.error("Internal server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black bg-gradient-to-r from-black via-zinc-900 to-black px-4">
      <Card className="w-full max-w-md border border-zinc-700 bg-zinc-900 text-white sm:px-4 md:px-6">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Hoop Rivals Logo"
              width={80}
              height={80}
              priority
            />
          </div>
          <CardTitle className="text-2xl">Welcome To Hoop Rivals</CardTitle>
          <CardDescription>Create your account here!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={e=>handleSubmit(e)} className="space-y-6">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-zinc-800 text-white"
                value={authData.email}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-zinc-800 text-white"
                value={authData.password}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="nickname"
                className="bg-zinc-800 text-white"
                value={authData.nickname}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-brand-orange hover:bg-orange-600"
            >
              {loading ? <ButtonLoading /> : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <p className="text-sm text-zinc-400">
            Already with us?{" "}
            <a href="/login" className="text-brand-orange">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
