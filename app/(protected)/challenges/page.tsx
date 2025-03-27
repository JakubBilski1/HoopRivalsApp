// app/challenges/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Loading from "@/app/loading";
import { challenges } from "@/utils/challenges";
import { User } from "@/types/User";

export default function ChallengesPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "GET"
      });
      if (response.status === 401) {
        window.location.href = "/login";
      } else if (response.status === 200) {
        const data: User = await response.json();
        setNickname(data.nickname);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="p-4 text-center text-white">
        <Loading />
      </div>
    )
  }

  return (
    <div className="p-4">
      {challenges.map((challenge) => (
        <Card key={challenge.slug} className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle className="text-xl">{challenge.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{challenge.description}</p>
            <Button
              onClick={() =>
                router.push(`/challenges/${nickname}-${challenge.slug}`)
              }
              className="mt-4"
            >
              Start Challenge
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
