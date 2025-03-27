"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Trophy, Pen } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import { ChallengeType } from "@prisma/client";
import FreeThrowDialog from "@/app/components/Dialogs/challenges/FreeThrowDialog";
import { FreeThrowChallengeDetails } from "@/app/components/Templates/FreeThrowChallengeDetails";
import Loading from "@/app/loading";

type Badges = {
  badgeName: string;
  badgeColor:
    | "default"
    | "best"
    | "secondBest"
    | "thirdBest"
    | "worst"
    | "secondary"
    | "destructive"
    | "outline";
  badgeIcon: string;
};

type FreeThrows = {
  id: number;
  challengeId: number;
  shotsMade: number;
  shotsTaken: number;
};

type Challenges = {
  id: number;
  challengeType: ChallengeType;
  date: string;
  userId: string;
};

type FullChallenges = Challenges & {
  freeThrows?: FreeThrows;
  challengeBadge: Badges;
};

export default function FreeThrowChallengePage() {
  const params = useParams();
  const challengeSlug = params.challengeSlug as string;

  // Nickname & challenge type parsed from the URL
  const [nickname, setNickname] = useState("");
  const [challengeType, setChallengeType] = useState("");

  // List of challenges, stats, and leaderboard data
  const [challenges, setChallenges] = useState<FullChallenges[]>([]);
  const [userStats, setUserStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [friendStats, setFriendStats] = useState<any[]>([]);
  const [friendStatsLoading, setFriendStatsLoading] = useState(true);

  // Sheet (leaderboard) state
  const [leaderboardSheetOpen, setLeaderboardSheetOpen] = useState(false);

  // Update dialog state and pre-filled update data
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState<{
    id: number;
    date: Date;
    attempts: string;
    madeShots: string;
  }>({ id: 0, date: new Date(), attempts: "", madeShots: "" });

  // Alert dialog state for removal confirmation
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [removeChallengeId, setRemoveChallengeId] = useState<number | null>(null);

  // Fetch challenges from the API
  const fetchChallenges = async (challType: string) => {
    try {
      const response = await fetch(`/api/challenge/${challType}`, {
        method: "GET"
      });
      if (response.status === 401) {
        window.location.href = "/login";
      } else if (response.status === 400) {
        toast.error("Invalid data");
      } else if (response.status === 200) {
        const data = await response.json();
        setChallenges(data);
      }
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  // Fetch user stats
  const fetchUserStats = async (challType: string) => {
    try {
      const response = await fetch(`/api/challenge/${challType}/stats`, {
        method: "GET"
      });
      if (!response.ok) {
        toast.error("Failed to load user stats");
        return;
      }
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast.error("Error fetching user stats");
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch friends stats
  const fetchFriendsStats = async (challType: string) => {
    try {
      const response = await fetch(`/api/challenge/${challType}/friendsStats`, {
        method: "GET"
      });
      if (!response.ok) {
        toast.error("Failed to load friends stats");
        return;
      }
      const data = await response.json();
      setFriendStats(data);
    } catch (error) {
      console.error("Error fetching friends stats:", error);
      toast.error("Error fetching friends stats");
    } finally {
      setFriendStatsLoading(false);
    }
  };

  // Re-fetch all data when a change occurs
  const updateAllData = () => {
    const currentChallengeType =
      challengeType ||
      challengeSlug.split("-").slice(1).join("-").replaceAll("_", " ");
    fetchChallenges(currentChallengeType);
    fetchUserStats(currentChallengeType);
    fetchFriendsStats(currentChallengeType);
  };

  // Remove challenge: called after confirmation in the alert dialog
  const handleRemove = async (challengeId: number) => {
    try {
      const response = await fetch(`/api/challenge/freethrows`, {
        method: "DELETE",
        body: JSON.stringify({
          challengeId,
        }),
      });
      if (response.ok) {
        toast.success("Challenge removed!");
        updateAllData();
      } else {
        const errorText = await response.text();
        toast.error(errorText);
      }
    } catch (error) {
      console.error("Error removing challenge:", error);
      toast.error("Error removing challenge");
    }
  };

  // Open update dialog using the challenge ID
  const handleUpdate = (challengeId: number) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) {
      toast.error("Challenge not found");
      return;
    }
    setUpdateData({
      id: challenge.id,
      date: new Date(challenge.date),
      attempts: challenge.freeThrows?.shotsTaken.toString() || "",
      madeShots: challenge.freeThrows?.shotsMade.toString() || "",
    });
    setUpdateModalOpen(true);
  };

  // Update challenge by sending a PUT request to the API
  const updateChallenge = async () => {
    try {
      const response = await fetch(
        `/api/challenge/freethrows`,
        {
          method: "PUT",
          body: JSON.stringify({
            date: updateData.date,
            attempts: parseInt(updateData.attempts),
            madeShots: parseInt(updateData.madeShots),
            challengeId: updateData.id,
          }),
        }
      );
      if (response.ok) {
        toast.success("Challenge updated!");
        setUpdateModalOpen(false);
        updateAllData();
      } else {
        const errorText = await response.text();
        toast.error(errorText);
      }
    } catch (error) {
      console.error("Error updating challenge:", error);
      toast.error("Error updating challenge");
    }
  };

  // Open remove alert dialog
  const openRemoveDialog = (challengeId: number) => {
    setRemoveChallengeId(challengeId);
    setRemoveDialogOpen(true);
  };

  // On mount, parse the URL slug and fetch initial data
  useEffect(() => {
    const parts = challengeSlug.split("-");
    if (parts.length >= 2) {
      setNickname(parts[0]);
      setChallengeType(parts.slice(1).join("-").replaceAll("_", " "));
    }
    const challType = parts.slice(1).join("-").replaceAll("_", " ");
    fetchChallenges(challType);
    fetchUserStats(challType);
    fetchFriendsStats(challType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeSlug]);

  return (
    <div className="p-4 space-y-6">
      {/* Top Card: User + Challenge Info */}
      <Card className="mx-auto max-w-md bg-gray-800 text-white">
        <CardHeader className="flex flex-col items-center sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl text-brand-orange">
            {nickname} - {challengeType}
          </CardTitle>
          <div className="flex gap-2">
            {/* Button to open Friends Leaderboard/Stats Sheet */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full p-2"
              onClick={() => setLeaderboardSheetOpen(true)}
            >
              <Trophy className="h-5 w-5" />
            </Button>

            {/* Friends Leaderboard/Stats Sheet */}
            <Sheet
              open={leaderboardSheetOpen}
              onOpenChange={setLeaderboardSheetOpen}
            >
              <SheetContent
                side="right"
                className="bg-gray-800 text-white w-full h-full gap-0"
              >
                <SheetHeader>
                  <SheetTitle>Friends & Stats</SheetTitle>
                </SheetHeader>
                <div>
                  <Tabs defaultValue="leaderboard" className="w-full p-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="leaderboard">
                        Friends Leaderboard
                      </TabsTrigger>
                      <TabsTrigger value="userStats">
                        User Stats
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="leaderboard" className="mt-4">
                      {friendStatsLoading ? (
                        <Loading />
                      ) : friendStats && friendStats.length > 0 ? (
                        <Accordion
                          type="single"
                          collapsible
                          className="space-y-2"
                        >
                          {friendStats.map((friend) => (
                            <AccordionItem key={friend.id} value={friend.id}>
                              <AccordionTrigger className="flex items-center gap-2">
                                <img
                                  src={friend.avatarUrl}
                                  alt={friend.nickname}
                                  className="w-8 h-8 rounded-full"
                                />
                                <span className="font-semibold">
                                  {friend.nickname}
                                </span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <strong>Total Challenges:</strong>{" "}
                                    {friend.stats.allTimeTotalChallenges}
                                  </div>
                                  <div>
                                    <strong>Shots Made:</strong>{" "}
                                    {friend.stats.allTimeShotsMade}
                                  </div>
                                  <div>
                                    <strong>Shots Taken:</strong>{" "}
                                    {friend.stats.allTimeShotsTaken}
                                  </div>
                                  <div>
                                    <strong>Efficiency:</strong>{" "}
                                    {(
                                      friend.stats.allTimeEfficiency * 100
                                    ).toFixed(2)}
                                    %
                                  </div>
                                </div>
                                <div className="mt-2 text-sm">
                                  <strong>Badges:</strong>
                                  <div className="mt-1 flex flex-wrap gap-2">
                                    <span>🥇 {friend.stats.firstPlace}</span>
                                    <span>🥈 {friend.stats.secondPlace}</span>
                                    <span>🥉 {friend.stats.thirdPlace}</span>
                                    <span>🔴 {friend.stats.worstBadges}</span>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <p className="text-center">
                          No friends stats available.
                        </p>
                      )}
                    </TabsContent>
                    <TabsContent value="userStats" className="mt-4">
                      {statsLoading ? (
                        <Loading />
                      ) : userStats ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-gray-700 rounded-lg shadow p-4 text-center">
                              <p className="text-md font-semibold">
                                Total Challenges
                              </p>
                              <p className="text-2xl font-bold">
                                {userStats.allTimeTotalChallenges}
                              </p>
                            </Card>
                            <Card className="bg-gray-700 rounded-lg shadow p-4 text-center">
                              <p className="text-md font-semibold">
                                Shots Made
                              </p>
                              <p className="text-2xl font-bold">
                                {userStats.allTimeShotsMade}
                              </p>
                            </Card>
                            <Card className="bg-gray-700 rounded-lg shadow p-4 text-center">
                              <p className="text-md font-semibold">
                                Shots Taken
                              </p>
                              <p className="text-2xl font-bold">
                                {userStats.allTimeShotsTaken}
                              </p>
                            </Card>
                            <Card className="bg-gray-700 rounded-lg shadow p-4 text-center">
                              <p className="text-md font-semibold">
                                Efficiency
                              </p>
                              <p className="text-2xl font-bold">
                                {(userStats.allTimeEfficiency * 100).toFixed(2)}%
                              </p>
                            </Card>
                          </div>
                          <Card className="bg-gray-700 rounded-lg shadow p-4">
                            <CardHeader className="p-0 gap-0">
                              <CardTitle className="text-md font-semibold">
                                Badges
                              </CardTitle>
                            </CardHeader>
                          </Card>
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-gray-700 rounded-lg shadow p-4 text-center">
                              <p className="text-md font-semibold">
                                Needs Improv. 🔴
                              </p>
                              <p className="text-2xl font-bold">
                                {userStats.worstBadges}
                              </p>
                            </Card>
                            <Card className="bg-gray-700 rounded-lg shadow p-4 text-center">
                              <p className="text-md font-semibold">
                                Keep The Pace 🥉
                              </p>
                              <p className="text-2xl font-bold">
                                {userStats.thirdPlace}
                              </p>
                            </Card>
                            <Card className="bg-gray-700 rounded-lg shadow p-4 text-center">
                              <p className="text-md font-semibold">
                                Great Shooting 🥈
                              </p>
                              <p className="text-2xl font-bold">
                                {userStats.secondPlace}
                              </p>
                            </Card>
                            <Card className="bg-gray-700 rounded-lg shadow p-4 text-center">
                              <p className="text-md font-semibold">
                                Elite Performance 🥇
                              </p>
                              <p className="text-2xl font-bold">
                                {userStats.firstPlace}
                              </p>
                            </Card>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center">No stats available.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>

            {/* New Challenge Dialog */}
            <FreeThrowDialog onChallengeAdded={updateAllData} />
          </div>
        </CardHeader>
      </Card>

      {/* Challenges List */}
      <Card className="mx-auto bg-gray-800 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-brand-orange">
            Your Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {challenges.length > 0 ? (
            challenges.map((challenge) => (
              <div
                key={challenge.id}
                className="border border-gray-700 rounded-md p-4"
              >
                <FreeThrowChallengeDetails
                  id={challenge.id}
                  challengeId={challenge.id}
                  shotsMade={challenge.freeThrows?.shotsMade || 0}
                  shotsTaken={challenge.freeThrows?.shotsTaken || 0}
                  badgeColor={challenge.challengeBadge.badgeColor || "default"}
                  badgeIcon={challenge.challengeBadge.badgeIcon || ""}
                  badgeName={challenge.challengeBadge.badgeName || ""}
                  onUpdate={handleUpdate} // Pass only the challenge ID
                  onRemove={openRemoveDialog}
                />
              </div>
            ))
          ) : (
            <div className="text-center text-white">
              <p>You have not recorded any challenges yet!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Challenge Modal */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Update Free Throw Entry</DialogTitle>
            <DialogDescription>
              Update your free throw challenge details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            <Input
              type="date"
              name="date"
              value={updateData.date.toISOString().split("T")[0]}
              onChange={(e) =>
                setUpdateData({
                  ...updateData,
                  date: new Date(e.target.value),
                })
              }
              className="w-full"
            />
            <Input
              type="number"
              name="attempts"
              placeholder="Attempts"
              value={updateData.attempts}
              onChange={(e) =>
                setUpdateData({ ...updateData, attempts: e.target.value })
              }
              className="w-full"
            />
            <Input
              type="number"
              name="madeShots"
              placeholder="Made Shots"
              value={updateData.madeShots}
              onChange={(e) =>
                setUpdateData({ ...updateData, madeShots: e.target.value })
              }
              className="w-full"
            />
            <Button variant="outline" onClick={updateChallenge}>
              Update Challenge
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog for Remove Confirmation */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent className="bg-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently remove the challenge and cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removeChallengeId !== null) {
                  handleRemove(removeChallengeId);
                }
                setRemoveDialogOpen(false);
                setRemoveChallengeId(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
